-- ============================================================
-- 049_onboarding_wizard.sql
-- Add onboarding state tracking to accounts
-- ============================================================

ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_accounts_onboarding ON public.accounts(onboarding_completed);

