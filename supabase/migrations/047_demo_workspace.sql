-- ============================================================
-- 047_demo_workspace.sql — Demo Workspace & Follow-Up Reminders
-- ============================================================

-- 1. Add demo flag and industry to accounts
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'real_estate';

-- 2. Add follow_up fields to conversations for scheduled reminders
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS follow_up_note TEXT;

CREATE INDEX IF NOT EXISTS idx_conversations_follow_up
  ON conversations (account_id, follow_up_at)
  WHERE follow_up_at IS NOT NULL;

-- 3. Add simulated flag to messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS is_simulated BOOLEAN NOT NULL DEFAULT false;

-- 4. Add lead_source to contacts
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'website';

CREATE INDEX IF NOT EXISTS idx_contacts_lead_source
  ON contacts (account_id, lead_source);
