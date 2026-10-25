-- ====================================================================
-- DOKIND PRODUCTION DATABASE SCHEMA & PAYMENT INTEGRITY MIGRATION
-- Standard: PostgreSQL 15+ / Supabase
-- Target: Durable, Concurrency-Safe Payment Processing & Auditing
-- ====================================================================

BEGIN;

-- 1. Campaign Core Table with Optimistic Locking
CREATE TABLE IF NOT EXISTS public.campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    goal_amount NUMERIC(12, 2) NOT NULL CHECK (goal_amount > 0),
    raised_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (raised_amount >= 0),
    net_raised_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (net_raised_amount >= 0),
    supporter_count INTEGER NOT NULL DEFAULT 0 CHECK (supporter_count >= 0),
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'active', 'paused', 'suspended', 'completed', 'rejected', 'expired')),
    has_80g BOOLEAN NOT NULL DEFAULT FALSE,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Authoritative Campaign Item Needs Catalog
CREATE TABLE IF NOT EXISTS public.campaign_item_needs (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
    quantity_required INTEGER NOT NULL CHECK (quantity_required > 0),
    quantity_funded INTEGER NOT NULL DEFAULT 0 CHECK (quantity_funded >= 0),
    max_per_order INTEGER CHECK (max_per_order > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Donations & Payment Orders Ledger
CREATE TABLE IF NOT EXISTS public.donations (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE RESTRICT,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    donor_phone TEXT,
    donor_pan TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 50.00),
    gross_amount NUMERIC(12, 2) NOT NULL,
    platform_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    platform_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_campaign_amount NUMERIC(12, 2) NOT NULL,
    dokind_contribution_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    dokind_contribution_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tip_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tip_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= amount),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    payment_method TEXT NOT NULL,
    razorpay_order_id TEXT NOT NULL UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    receipt_number TEXT NOT NULL UNIQUE,
    tax_exemption_80g BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_frequency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Authorized Item Allocations per Donation Order
CREATE TABLE IF NOT EXISTS public.donation_item_allocations (
    id BIGSERIAL PRIMARY KEY,
    donation_id TEXT NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES public.campaign_item_needs(id) ON DELETE RESTRICT,
    item_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Webhook Idempotency & Replay Protection Ledger
CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    order_id TEXT,
    payment_id TEXT,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payload_hash TEXT NOT NULL
);

-- 6. Refunds Ledger
CREATE TABLE IF NOT EXISTS public.refund_records (
    id TEXT PRIMARY KEY,
    donation_id TEXT NOT NULL REFERENCES public.donations(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL CHECK (actor_role IN ('super_admin', 'ops_admin', 'finance', 'head_staff', 'Razorpay Webhook')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Immutable Platform Audit Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    reason TEXT,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Rapid Querying and Integrity Lookups
CREATE INDEX IF NOT EXISTS idx_donations_order_id ON public.donations(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_id ON public.donations(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON public.donations(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_order ON public.processed_webhook_events(order_id);

-- ====================================================================
-- ATOMIC TRANSACTION STORED PROCEDURE: IDEMPOTENT PAYMENT COMPLETION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.complete_payment_idempotent(
    p_order_id TEXT,
    p_payment_id TEXT,
    p_signature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_donation RECORD;
    v_campaign RECORD;
    v_alloc RECORD;
BEGIN
    -- 1. Lock donation row to serialize concurrent webhooks and user callbacks
    SELECT * INTO v_donation
    FROM public.donations
    WHERE razorpay_order_id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order ID % not found in database records', p_order_id;
    END IF;

    -- Idempotency: if already completed, return without double-crediting
    IF v_donation.status = 'succeeded' THEN
        RETURN jsonb_build_object(
            'success', true,
            'idempotent', true,
            'donation_id', v_donation.id,
            'receipt_number', v_donation.receipt_number
        );
    END IF;

    -- Update donation state
    UPDATE public.donations
    SET status = 'succeeded',
        razorpay_payment_id = p_payment_id,
        razorpay_signature = p_signature,
        updated_at = NOW()
    WHERE id = v_donation.id;

    -- 2. Lock and update campaign totals atomically
    SELECT * INTO v_campaign
    FROM public.campaigns
    WHERE id = v_donation.campaign_id
    FOR UPDATE;

    UPDATE public.campaigns
    SET raised_amount = raised_amount + v_donation.amount,
        net_raised_amount = net_raised_amount + v_donation.net_campaign_amount,
        supporter_count = supporter_count + 1,
        version = version + 1,
        updated_at = NOW()
    WHERE id = v_campaign.id;

    -- 3. Increment item quantities funded
    FOR v_alloc IN
        SELECT item_id, quantity
        FROM public.donation_item_allocations
        WHERE donation_id = v_donation.id
    LOOP
        UPDATE public.campaign_item_needs
        SET quantity_funded = quantity_funded + v_alloc.quantity,
            updated_at = NOW()
        WHERE id = v_alloc.item_id;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'idempotent', false,
        'donation_id', v_donation.id,
        'receipt_number', v_donation.receipt_number
    );
END;
$$;

COMMIT;
