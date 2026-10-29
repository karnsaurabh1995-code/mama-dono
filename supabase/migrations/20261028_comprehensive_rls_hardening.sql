-- ====================================================================
-- DOKIND PRODUCTION DATABASE SECURITY & COMPREHENSIVE RLS HARDENING
-- Standard: PostgreSQL 15+ / Supabase
-- Target: Zero-Trust Row Level Security (RLS) across all application tables
-- ====================================================================

BEGIN;

-- 1. Enable Row Level Security (RLS) on all core tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaign_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaign_item_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recurring_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Staff and Admins full access profiles" ON public.profiles;
CREATE POLICY "Staff and Admins full access profiles"
    ON public.profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('super_admin', 'admin', 'ops_admin', 'reviewer', 'finance')
        )
    );

-- --------------------------------------------------------------------
-- 3. ORGANIZATIONS (VERIFIED NGOS) POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view verified organizations" ON public.organizations;
CREATE POLICY "Public can view verified organizations"
    ON public.organizations FOR SELECT
    USING (verification_status = 'verified');

DROP POLICY IF EXISTS "Organization managers can view own org" ON public.organizations;
CREATE POLICY "Organization managers can view own org"
    ON public.organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.organization_id = organizations.id
        )
    );

DROP POLICY IF EXISTS "Staff and Admins full access organizations" ON public.organizations;
CREATE POLICY "Staff and Admins full access organizations"
    ON public.organizations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('super_admin', 'admin', 'ops_admin', 'reviewer')
        )
    );

-- --------------------------------------------------------------------
-- 4. CAUSES POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can read active causes" ON public.causes;
CREATE POLICY "Public can read active causes"
    ON public.causes FOR SELECT
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage causes" ON public.causes;
CREATE POLICY "Admins manage causes"
    ON public.causes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('super_admin', 'admin', 'content_editor')
        )
    );

-- --------------------------------------------------------------------
-- 5. CAMPAIGNS POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active campaigns" ON public.campaigns;
CREATE POLICY "Public can view active campaigns"
    ON public.campaigns FOR SELECT
    USING (status IN ('active', 'completed'));

DROP POLICY IF EXISTS "Organizers can view and edit own campaigns" ON public.campaigns;
CREATE POLICY "Organizers can view and edit own campaigns"
    ON public.campaigns FOR ALL
    USING (
        auth.uid()::text = organizer_id::text
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.organization_id = campaigns.organization_id
        )
    );

DROP POLICY IF EXISTS "Staff and Admins full access campaigns" ON public.campaigns;
CREATE POLICY "Staff and Admins full access campaigns"
    ON public.campaigns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('super_admin', 'admin', 'ops_admin', 'reviewer', 'campaign_manager', 'finance')
        )
    );

-- --------------------------------------------------------------------
-- 6. CAMPAIGN SUB-ITEMS POLICIES (Budget, Updates, Product Needs)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view items of active campaigns" ON public.campaign_budget_items;
CREATE POLICY "Public can view items of active campaigns"
    ON public.campaign_budget_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_budget_items.campaign_id
            AND c.status IN ('active', 'completed')
        )
    );

DROP POLICY IF EXISTS "Public can view updates of active campaigns" ON public.campaign_updates;
CREATE POLICY "Public can view updates of active campaigns"
    ON public.campaign_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_updates.campaign_id
            AND c.status IN ('active', 'completed')
        )
    );

DROP POLICY IF EXISTS "Public can view product needs of active campaigns" ON public.product_needs;
CREATE POLICY "Public can view product needs of active campaigns"
    ON public.product_needs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = product_needs.campaign_id
            AND c.status IN ('active', 'completed')
        )
    );

-- --------------------------------------------------------------------
-- 7. DONATIONS & RECURRING PLANS POLICIES (Strict IDOR Protection)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Donors can view only own donations" ON public.donations;
CREATE POLICY "Donors can view only own donations"
    ON public.donations FOR SELECT
    USING (
        auth.uid()::text = donor_id::text
        OR auth.jwt() ->> 'email' = donor_email
    );

DROP POLICY IF EXISTS "Finance and Admins full access donations" ON public.donations;
CREATE POLICY "Finance and Admins full access donations"
    ON public.donations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('super_admin', 'admin', 'finance')
        )
    );

DROP POLICY IF EXISTS "Users can view and cancel own recurring plans" ON public.recurring_plans;
CREATE POLICY "Users can view and cancel own recurring plans"
    ON public.recurring_plans FOR ALL
    USING (
        auth.uid() = user_id
        OR auth.jwt() ->> 'email' = user_email
    );

DROP POLICY IF EXISTS "Finance and Admins full access recurring plans" ON public.recurring_plans;
CREATE POLICY "Finance and Admins full access recurring plans"
    ON public.recurring_plans FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('super_admin', 'admin', 'finance')
        )
    );

-- --------------------------------------------------------------------
-- 8. AUDIT LOGS (Read-Only for Super Admin, Immutable Ledger)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Super Admins view audit logs" ON public.audit_logs;
CREATE POLICY "Super Admins view audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'super_admin'
        )
    );

COMMIT;
