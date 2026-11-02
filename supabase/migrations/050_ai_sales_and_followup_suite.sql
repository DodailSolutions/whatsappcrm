-- ============================================================
-- 050_ai_sales_and_followup_suite.sql
-- AI Sales, Follow-up & Automation Suite Schema Foundations
-- ============================================================

-- 1. Contacts enhancement: CRM qualification fields & messaging opt-out
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS budget text,
  ADD COLUMN IF NOT EXISTS location_preference text,
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS service_interest text,
  ADD COLUMN IF NOT EXISTS is_opted_out boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_contacts_account_opted_out 
  ON contacts(account_id, is_opted_out);

-- 2. Automations enhancement: Category, stop conditions, and handoff rules
ALTER TABLE automations
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS stop_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS handoff_rules jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_automations_account_category 
  ON automations(account_id, category);

-- 3. Appointments & Bookings entity for Healthcare OPD & Service Bookings
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  provider_name text,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show')),
  clinic_location text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_account_date 
  ON appointments(account_id, appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_contact 
  ON appointments(contact_id);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS appointments_select ON appointments;
CREATE POLICY appointments_select ON appointments FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS appointments_insert ON appointments;
CREATE POLICY appointments_insert ON appointments FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS appointments_update ON appointments;
CREATE POLICY appointments_update ON appointments FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS appointments_delete ON appointments;
CREATE POLICY appointments_delete ON appointments FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- Trigger to update updated_at on appointments
CREATE OR REPLACE FUNCTION public.update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointments_updated_at ON appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_appointments_updated_at();

-- 4. AI Sales Agent Configuration table
CREATE TABLE IF NOT EXISTS ai_sales_agent_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT false,
  auto_reply_enabled boolean NOT NULL DEFAULT false,
  agent_name text NOT NULL DEFAULT 'Dodail AI Sales Agent',
  qualification_questions jsonb NOT NULL DEFAULT '[
    {"key": "budget", "question": "What budget range are you working with?", "required": true},
    {"key": "timeline", "question": "When are you looking to get started or purchase?", "required": true},
    {"key": "location_preference", "question": "What is your preferred location or area?", "required": false},
    {"key": "service_interest", "question": "Which specific product or service are you interested in?", "required": true}
  ]'::jsonb,
  target_pipeline_id uuid REFERENCES pipelines(id) ON DELETE SET NULL,
  target_stage_id uuid REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  default_assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  prohibit_unconfirmed_commitments boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_sales_agent_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_sales_agent_configs_select ON ai_sales_agent_configs;
CREATE POLICY ai_sales_agent_configs_select ON ai_sales_agent_configs FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS ai_sales_agent_configs_insert ON ai_sales_agent_configs;
CREATE POLICY ai_sales_agent_configs_insert ON ai_sales_agent_configs FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS ai_sales_agent_configs_update ON ai_sales_agent_configs;
CREATE POLICY ai_sales_agent_configs_update ON ai_sales_agent_configs FOR UPDATE
  USING (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS ai_sales_agent_configs_delete ON ai_sales_agent_configs;
CREATE POLICY ai_sales_agent_configs_delete ON ai_sales_agent_configs FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- Trigger for ai_sales_agent_configs updated_at
CREATE OR REPLACE FUNCTION public.update_ai_sales_agent_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_sales_agent_configs_updated_at ON ai_sales_agent_configs;
CREATE TRIGGER ai_sales_agent_configs_updated_at
  BEFORE UPDATE ON ai_sales_agent_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_sales_agent_configs_updated_at();

