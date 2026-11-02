-- ============================================================
-- 053_landing_cms_and_revisions.sql
-- Landing Page Drafts, Revisions History, and CMS Block Architecture
-- ============================================================

-- 1. Extend super_admin_settings with draft state & publication timestamp
ALTER TABLE super_admin_settings
  ADD COLUMN IF NOT EXISTS landing_page_draft JSONB,
  ADD COLUMN IF NOT EXISTS landing_page_published_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS landing_page_published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Landing Page Revisions Table (for rollback & audit history)
CREATE TABLE IF NOT EXISTS landing_page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Published Version',
  cms_data JSONB NOT NULL,
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_page_revisions_created ON landing_page_revisions(created_at DESC);

-- Enable RLS
ALTER TABLE landing_page_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS landing_page_revisions_select ON landing_page_revisions;
CREATE POLICY landing_page_revisions_select ON landing_page_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accounts a
      JOIN profiles p ON p.account_id = a.id
      WHERE p.user_id = auth.uid() AND p.account_role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS landing_page_revisions_insert ON landing_page_revisions;
CREATE POLICY landing_page_revisions_insert ON landing_page_revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts a
      JOIN profiles p ON p.account_id = a.id
      WHERE p.user_id = auth.uid() AND p.account_role IN ('owner', 'admin')
    )
  );

