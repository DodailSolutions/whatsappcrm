-- ============================================================
-- 048_saas_multi_workspace.sql
--
-- SaaS Multi-Tenant Architecture & Audit Trail:
-- 1. `account_members` table for multi-workspace membership & deactivation
-- 2. `audit_logs` table for workspace audit trail
-- 3. Updated `is_account_member` security definer function
-- 4. RLS policies on account_members and audit_logs
-- 5. Updated `handle_new_user()` to automatically record membership
-- ============================================================

-- 1. account_members table
CREATE TABLE IF NOT EXISTS public.account_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.account_role_enum NOT NULL DEFAULT 'agent',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_account_members_account_id ON public.account_members(account_id);
CREATE INDEX IF NOT EXISTS idx_account_members_user_id ON public.account_members(user_id);

-- Backfill existing owners and profile members
INSERT INTO public.account_members (account_id, user_id, role, status)
SELECT id, owner_user_id, 'owner'::public.account_role_enum, 'active'
FROM public.accounts
WHERE owner_user_id IS NOT NULL
ON CONFLICT (account_id, user_id) DO NOTHING;

INSERT INTO public.account_members (account_id, user_id, role, status)
SELECT p.account_id, p.user_id, p.account_role, 'active'
FROM public.profiles p
WHERE p.account_id IS NOT NULL
ON CONFLICT (account_id, user_id) DO NOTHING;

-- 2. audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_account_id ON public.audit_logs(account_id, created_at DESC);

-- 3. Update is_account_member function to check account_members (and active status)
CREATE OR REPLACE FUNCTION public.is_account_member(
  target_account_id UUID,
  min_role public.account_role_enum DEFAULT 'viewer'
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Primary: Check account_members table with active status
    SELECT 1
    FROM public.account_members am
    WHERE am.user_id = auth.uid()
      AND am.account_id = target_account_id
      AND am.status = 'active'
      AND CASE am.role
            WHEN 'owner'  THEN 4
            WHEN 'admin'  THEN 3
            WHEN 'agent'  THEN 2
            WHEN 'viewer' THEN 1
          END
        >=
          CASE min_role
            WHEN 'owner'  THEN 4
            WHEN 'admin'  THEN 3
            WHEN 'agent'  THEN 2
            WHEN 'viewer' THEN 1
          END
    UNION
    -- Fallback: Check accounts owner directly
    SELECT 1
    FROM public.accounts a
    WHERE a.id = target_account_id
      AND a.owner_user_id = auth.uid()
    UNION
    -- Compatibility fallback: Check profiles row if active
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.account_id = target_account_id
      AND CASE p.account_role
            WHEN 'owner'  THEN 4
            WHEN 'admin'  THEN 3
            WHEN 'agent'  THEN 2
            WHEN 'viewer' THEN 1
          END
        >=
          CASE min_role
            WHEN 'owner'  THEN 4
            WHEN 'admin'  THEN 3
            WHEN 'agent'  THEN 2
            WHEN 'viewer' THEN 1
          END
  );
$$;

ALTER FUNCTION public.is_account_member(UUID, public.account_role_enum) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_account_member(UUID, public.account_role_enum) TO authenticated, service_role;

-- 4. Enable RLS on account_members and audit_logs
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS account_members_select ON public.account_members;
CREATE POLICY account_members_select ON public.account_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_account_member(account_id)
  );

DROP POLICY IF EXISTS account_members_insert ON public.account_members;
CREATE POLICY account_members_insert ON public.account_members
  FOR INSERT
  WITH CHECK (
    is_account_member(account_id, 'admin')
  );

DROP POLICY IF EXISTS account_members_update ON public.account_members;
CREATE POLICY account_members_update ON public.account_members
  FOR UPDATE
  USING (
    is_account_member(account_id, 'admin')
  );

DROP POLICY IF EXISTS account_members_delete ON public.account_members;
CREATE POLICY account_members_delete ON public.account_members
  FOR DELETE
  USING (
    is_account_member(account_id, 'admin')
  );

DROP POLICY IF EXISTS audit_logs_select ON public.audit_logs;
CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT
  USING (
    is_account_member(account_id, 'admin')
  );

DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    is_account_member(account_id)
  );

-- 5. Updated handle_new_user to populate account_members
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_account_id UUID;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  INSERT INTO public.accounts (name, owner_user_id)
  VALUES (COALESCE(NULLIF(v_full_name, ''), NEW.email, 'My Workspace'), NEW.id)
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (user_id, full_name, email, account_id, account_role)
  VALUES (NEW.id, v_full_name, NEW.email, v_account_id, 'owner');

  INSERT INTO public.account_members (account_id, user_id, role, status)
  VALUES (v_account_id, NEW.id, 'owner', 'active')
  ON CONFLICT (account_id, user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

