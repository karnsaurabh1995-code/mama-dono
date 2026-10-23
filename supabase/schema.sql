-- =========================================================================
-- SEVASETU CROWDFUNDING PLATFORM — SUPABASE / POSTGRESQL PRODUCTION SCHEMA
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  pan_number VARCHAR(10) CHECK (pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  role TEXT NOT NULL DEFAULT 'donor' CHECK (role IN ('super_admin', 'ops_admin', 'reviewer', 'finance', 'content_editor', 'organization_manager', 'fundraiser', 'donor')),
  avatar_url TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ORGANIZATIONS (VERIFIED NGOS)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  website TEXT,
  darpan_id VARCHAR(50),
  pan_number VARCHAR(10) NOT NULL,
  reg_12a VARCHAR(50),
  reg_80g VARCHAR(50),
  fcra_registered BOOLEAN NOT NULL DEFAULT FALSE,
  fcra_number VARCHAR(50),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= 2100),
  campaigns_count INTEGER NOT NULL DEFAULT 0,
  total_raised NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  beneficiaries_impacted INTEGER NOT NULL DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CAUSES
CREATE TABLE IF NOT EXISTS causes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  banner_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  story TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES causes(id),
  campaign_type TEXT NOT NULL DEFAULT 'one-time' CHECK (campaign_type IN ('one-time', 'monthly', 'product')),
  goal_amount NUMERIC(14, 2) NOT NULL CHECK (goal_amount > 0),
  raised_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (raised_amount >= 0),
  supporter_count INTEGER NOT NULL DEFAULT 0 CHECK (supporter_count >= 0),
  deadline DATE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  urgent BOOLEAN NOT NULL DEFAULT FALSE,
  staff_pick BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'active', 'paused', 'suspended', 'completed', 'rejected', 'expired')),
  verified_status TEXT NOT NULL DEFAULT 'pending' CHECK (verified_status IN ('unverified', 'pending', 'verified')),
  has_80g BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT NOT NULL,
  gallery_urls TEXT[] DEFAULT '{}',
  beneficiary_name TEXT NOT NULL,
  beneficiary_location TEXT NOT NULL,
  hospital_name TEXT,
  organizer_id UUID REFERENCES profiles(id),
  organizer_name TEXT NOT NULL,
  organizer_role TEXT NOT NULL DEFAULT 'individual' CHECK (organizer_role IN ('individual', 'organization')),
  organization_id UUID REFERENCES organizations(id),
  organization_name TEXT,
  use_of_funds TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CAMPAIGN BUDGET ITEMS
CREATE TABLE IF NOT EXISTS campaign_budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CAMPAIGN UPDATES
CREATE TABLE IF NOT EXISTS campaign_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  milestone_achieved TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRODUCT GIVING CATALOG
CREATE TABLE IF NOT EXISTS product_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_cost NUMERIC(10, 2) NOT NULL CHECK (unit_cost > 0),
  quantity_required INTEGER NOT NULL CHECK (quantity_required > 0),
  quantity_funded INTEGER NOT NULL DEFAULT 0 CHECK (quantity_funded >= 0),
  unit TEXT NOT NULL DEFAULT 'units',
  image_url TEXT NOT NULL,
  fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'procuring', 'dispatched', 'delivered')),
  target_beneficiaries TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DONATIONS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  campaign_title TEXT NOT NULL,
  donor_id UUID REFERENCES profiles(id),
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  donor_pan VARCHAR(10) CHECK (donor_pan IS NULL OR donor_pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  tip_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= amount),
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('created', 'pending', 'authorized', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'card', 'netbanking', 'wallet', 'razorpay_simulated')),
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  receipt_number TEXT UNIQUE NOT NULL,
  tax_exemption_80g BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. RECURRING PLANS
CREATE TABLE IF NOT EXISTS recurring_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  user_email TEXT NOT NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  next_billing_date DATE NOT NULL,
  last_billing_date DATE,
  razorpay_subscription_id TEXT UNIQUE NOT NULL,
  total_cycles_charged INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_featured ON campaigns(featured);
CREATE INDEX IF NOT EXISTS idx_campaigns_urgent ON campaigns(urgent);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_order_id ON donations(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_product_needs_campaign ON product_needs(campaign_id);

-- 12. AUTOMATIC CAMPAIGN TOTAL RECALCULATION TRIGGER
CREATE OR REPLACE FUNCTION update_campaign_raised_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'succeeded' AND (OLD.status IS NULL OR OLD.status != 'succeeded')) THEN
    UPDATE campaigns
    SET raised_amount = raised_amount + NEW.amount,
        supporter_count = supporter_count + 1,
        updated_at = NOW()
    WHERE id = NEW.campaign_id;
  ELSIF (NEW.status = 'refunded' AND OLD.status = 'succeeded') THEN
    UPDATE campaigns
    SET raised_amount = GREATEST(0, raised_amount - NEW.amount),
        supporter_count = GREATEST(0, supporter_count - 1),
        updated_at = NOW()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_donation_status_update ON donations;
CREATE TRIGGER trg_donation_status_update
AFTER UPDATE OF status ON donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_raised_totals();

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read active approved campaigns
CREATE POLICY "Public can view active approved campaigns"
  ON campaigns FOR SELECT
  USING (status IN ('active', 'completed'));

-- Campaign organizers can manage their own campaigns
CREATE POLICY "Organizers can view and edit own campaigns"
  ON campaigns FOR ALL
  USING (auth.uid() = organizer_id);

-- Donors can only view their own donations
CREATE POLICY "Donors can view their own donations"
  ON donations FOR SELECT
  USING (auth.uid() = donor_id OR auth.jwt() ->> 'email' = donor_email);

-- Super admins and ops admins have unrestricted access
CREATE POLICY "Admins full access profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'ops_admin'))
);
CREATE POLICY "Admins full access campaigns" ON campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'ops_admin', 'reviewer'))
);
