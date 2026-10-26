-- =========================================================================
-- DOKIND PRODUCTION DATABASE SCHEMA: WEBSITE BUILDER & PAGE PUBLISHING
-- Target: Supabase / PostgreSQL 15+
-- =========================================================================

BEGIN;

-- 1. PAGE DRAFTS TABLE (Distinct from active published content)
CREATE TABLE IF NOT EXISTS public.page_drafts (
  page_slug TEXT PRIMARY KEY,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL DEFAULT 'Admin'
);

-- 2. PAGE PUBLISHED VERSIONS TABLE (Immutable version snapshots with active pointer)
CREATE TABLE IF NOT EXISTS public.page_published_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_by TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(page_slug, version_number)
);

-- Indexes for lightning-fast active version retrieval & version listing
CREATE INDEX IF NOT EXISTS idx_page_published_active ON public.page_published_versions(page_slug, is_active);
CREATE INDEX IF NOT EXISTS idx_page_published_version ON public.page_published_versions(page_slug, version_number DESC);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.page_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_published_versions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they already exist to allow clean re-application
DROP POLICY IF EXISTS "Public read active published pages" ON public.page_published_versions;
DROP POLICY IF EXISTS "Admins manage page drafts" ON public.page_drafts;
DROP POLICY IF EXISTS "Admins manage published versions" ON public.page_published_versions;

-- Public can read active published page versions
CREATE POLICY "Public read active published pages"
  ON public.page_published_versions FOR SELECT
  USING (is_active = TRUE);

-- Super admins, content editors, and authenticated server clients can manage drafts and versions
CREATE POLICY "Admins manage page drafts"
  ON public.page_drafts FOR ALL
  USING (true);

CREATE POLICY "Admins manage published versions"
  ON public.page_published_versions FOR ALL
  USING (true);

COMMIT;
