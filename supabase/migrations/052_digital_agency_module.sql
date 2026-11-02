-- ============================================================
-- 052_digital_agency_module.sql
-- Digital Marketing Agency & Digital Solutions Provider Module:
-- Clients, Brand Profiles, Projects, Tasks, Content Calendar & Approvals
-- ============================================================

-- 1. Agency Clients Table (Multi-Client management within agency workspace)
CREATE TABLE IF NOT EXISTS agency_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT,
  website TEXT,
  description TEXT,
  industry TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  address TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  account_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_team_ids TEXT[] NOT NULL DEFAULT '{}',
  contract_start DATE,
  contract_end DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('lead', 'prospect', 'onboarding', 'active', 'paused', 'completed', 'churned')),
  purchased_service_ids TEXT[] NOT NULL DEFAULT '{}',
  retainer_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  billing_frequency TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_frequency IN ('monthly', 'quarterly', 'yearly', 'milestone', 'one_time')),
  brand_profile JSONB NOT NULL DEFAULT '{
    "brand_name": "",
    "brand_voice": "Professional, informative and engaging",
    "target_audience": "",
    "brand_colors": ["#111827", "#F15A22"],
    "website_urls": [],
    "social_profiles": {},
    "guidelines": "",
    "content_restrictions": "",
    "hashtags": []
  }'::jsonb,
  approval_settings JSONB NOT NULL DEFAULT '{
    "require_client_approval": true,
    "approval_deadline_hours": 48,
    "notify_whatsapp": true
  }'::jsonb,
  onboarding_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agency_clients_account ON agency_clients(account_id, status);
ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agency_clients_select ON agency_clients;
CREATE POLICY agency_clients_select ON agency_clients FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS agency_clients_insert ON agency_clients;
CREATE POLICY agency_clients_insert ON agency_clients FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_clients_update ON agency_clients;
CREATE POLICY agency_clients_update ON agency_clients FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_clients_delete ON agency_clients;
CREATE POLICY agency_clients_delete ON agency_clients FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- 2. Agency Projects Table
CREATE TABLE IF NOT EXISTS agency_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES agency_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'marketing_campaign'
    CHECK (project_type IN (
      'website_development',
      'seo_campaign',
      'social_media',
      'paid_advertising',
      'branding',
      'content_production',
      'ai_automation',
      'crm_implementation',
      'custom_software',
      'marketing_campaign',
      'other'
    )),
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')),
  start_date DATE,
  due_date DATE,
  budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  assigned_team_ids TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agency_projects_client ON agency_projects(client_id);
ALTER TABLE agency_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agency_projects_select ON agency_projects;
CREATE POLICY agency_projects_select ON agency_projects FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS agency_projects_insert ON agency_projects;
CREATE POLICY agency_projects_insert ON agency_projects FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_projects_update ON agency_projects;
CREATE POLICY agency_projects_update ON agency_projects FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_projects_delete ON agency_projects;
CREATE POLICY agency_projects_delete ON agency_projects FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- 3. Agency Tasks Table (Kanban & List views)
CREATE TABLE IF NOT EXISTS agency_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  project_id UUID REFERENCES agency_projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES agency_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'waiting_for_client', 'approved', 'completed', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  estimated_hours NUMERIC(6, 2) DEFAULT 0,
  actual_hours NUMERIC(6, 2) DEFAULT 0,
  client_visible BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agency_tasks_project ON agency_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_agency_tasks_client ON agency_tasks(client_id);
ALTER TABLE agency_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agency_tasks_select ON agency_tasks;
CREATE POLICY agency_tasks_select ON agency_tasks FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS agency_tasks_insert ON agency_tasks;
CREATE POLICY agency_tasks_insert ON agency_tasks FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_tasks_update ON agency_tasks;
CREATE POLICY agency_tasks_update ON agency_tasks FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_tasks_delete ON agency_tasks;
CREATE POLICY agency_tasks_delete ON agency_tasks FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- 4. Social Media & Content Calendar Items Table
CREATE TABLE IF NOT EXISTS agency_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES agency_clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES agency_projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'static_post'
    CHECK (content_type IN ('static_post', 'carousel', 'reel', 'short_video', 'story', 'linkedin_post', 'blog', 'email', 'whatsapp', 'other')),
  channel TEXT NOT NULL DEFAULT 'instagram'
    CHECK (channel IN ('instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'blog', 'email', 'whatsapp', 'other')),
  publish_date DATE,
  publish_time TIME,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'idea'
    CHECK (status IN (
      'idea',
      'planned',
      'brief_created',
      'in_production',
      'internal_review',
      'client_approval',
      'approved',
      'scheduled',
      'published',
      'rejected',
      'needs_revision'
    )),
  caption TEXT,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  creative_assets JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta TEXT,
  client_feedback TEXT,
  performance_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agency_content_client_date ON agency_content_items(client_id, publish_date);
ALTER TABLE agency_content_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agency_content_select ON agency_content_items;
CREATE POLICY agency_content_select ON agency_content_items FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS agency_content_insert ON agency_content_items;
CREATE POLICY agency_content_insert ON agency_content_items FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_content_update ON agency_content_items;
CREATE POLICY agency_content_update ON agency_content_items FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_content_delete ON agency_content_items;
CREATE POLICY agency_content_delete ON agency_content_items FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- 5. Proposals & Contracts Table
CREATE TABLE IF NOT EXISTS agency_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES agency_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scope_of_work TEXT,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline TEXT,
  pricing_model TEXT NOT NULL DEFAULT 'monthly_retainer',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  terms TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'under_review', 'accepted', 'rejected', 'converted_to_project')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agency_proposals_client ON agency_proposals(client_id);
ALTER TABLE agency_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agency_proposals_select ON agency_proposals;
CREATE POLICY agency_proposals_select ON agency_proposals FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS agency_proposals_insert ON agency_proposals;
CREATE POLICY agency_proposals_insert ON agency_proposals FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_proposals_update ON agency_proposals;
CREATE POLICY agency_proposals_update ON agency_proposals FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agency_proposals_delete ON agency_proposals;
CREATE POLICY agency_proposals_delete ON agency_proposals FOR DELETE
  USING (is_account_member(account_id, 'admin'));

