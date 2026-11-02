-- ============================================================
-- 051_business_catalog_and_saas.sql
-- Business Catalog, Multi-Location, Dental Module, Booking Engine,
-- Treatment Plans, Billing/Invoicing, and SaaS Super Admin Architecture
-- ============================================================

-- 1. Accounts Enhancement: Business Type, Operating Model, Booking Slug, Subscription Tier
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'real_estate',
  ADD COLUMN IF NOT EXISTS operating_model JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS booking_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS plan_limits JSONB NOT NULL DEFAULT '{
    "max_contacts": 1000,
    "max_team_members": 5,
    "max_locations": 1,
    "max_ai_conversations": 500,
    "has_custom_catalog": true
  }'::jsonb;

CREATE INDEX IF NOT EXISTS idx_accounts_business_type ON accounts(business_type);
CREATE INDEX IF NOT EXISTS idx_accounts_booking_slug ON accounts(booking_slug);

-- 2. Locations Table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  business_hours JSONB NOT NULL DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "tuesday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "wednesday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "thursday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "friday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "saturday": {"open": "09:00", "close": "15:00", "isOpen": true},
    "sunday": {"open": "10:00", "close": "14:00", "isOpen": false}
  }'::jsonb,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_account ON locations(account_id);
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS locations_select ON locations;
CREATE POLICY locations_select ON locations FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS locations_insert ON locations;
CREATE POLICY locations_insert ON locations FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS locations_update ON locations;
CREATE POLICY locations_update ON locations FOR UPDATE
  USING (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS locations_delete ON locations;
CREATE POLICY locations_delete ON locations FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- 3. Clinic / Business Resources (Dental chairs, consultation rooms, service bays, rental cars)
CREATE TABLE IF NOT EXISTS clinic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'chair' CHECK (resource_type IN ('chair', 'room', 'equipment', 'vehicle', 'bay', 'other')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinic_resources_account ON clinic_resources(account_id);
CREATE INDEX IF NOT EXISTS idx_clinic_resources_location ON clinic_resources(location_id);
ALTER TABLE clinic_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clinic_resources_select ON clinic_resources;
CREATE POLICY clinic_resources_select ON clinic_resources FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS clinic_resources_insert ON clinic_resources;
CREATE POLICY clinic_resources_insert ON clinic_resources FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS clinic_resources_update ON clinic_resources;
CREATE POLICY clinic_resources_update ON clinic_resources FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS clinic_resources_delete ON clinic_resources;
CREATE POLICY clinic_resources_delete ON clinic_resources FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- 4. Universal Catalog Categories
CREATE TABLE IF NOT EXISTS catalog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_categories_account ON catalog_categories(account_id);
ALTER TABLE catalog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalog_categories_select ON catalog_categories;
CREATE POLICY catalog_categories_select ON catalog_categories FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS catalog_categories_insert ON catalog_categories;
CREATE POLICY catalog_categories_insert ON catalog_categories FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS catalog_categories_update ON catalog_categories;
CREATE POLICY catalog_categories_update ON catalog_categories FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS catalog_categories_delete ON catalog_categories;
CREATE POLICY catalog_categories_delete ON catalog_categories FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- 5. Universal Catalog Items (Services, Products, Packages, Procedures, Rentals, Custom)
CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES catalog_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'service' 
    CHECK (item_type IN ('service', 'product', 'package', 'procedure', 'rental', 'custom')),
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  location_ids TEXT[] NOT NULL DEFAULT '{}',
  assigned_staff_ids TEXT[] NOT NULL DEFAULT '{}',
  required_booking BOOLEAN NOT NULL DEFAULT true,
  custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_items_account ON catalog_items(account_id, is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(category_id);
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalog_items_select ON catalog_items;
CREATE POLICY catalog_items_select ON catalog_items FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS catalog_items_insert ON catalog_items;
CREATE POLICY catalog_items_insert ON catalog_items FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS catalog_items_update ON catalog_items;
CREATE POLICY catalog_items_update ON catalog_items FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS catalog_items_delete ON catalog_items;
CREATE POLICY catalog_items_delete ON catalog_items FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- Trigger for catalog_items updated_at
CREATE OR REPLACE FUNCTION public.update_catalog_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS catalog_items_updated_at ON catalog_items;
CREATE TRIGGER catalog_items_updated_at
  BEFORE UPDATE ON catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_catalog_items_updated_at();

-- 6. Appointments & Bookings Table (Create if not exists and Enhance)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  provider_name TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show')),
  clinic_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resource_id UUID REFERENCES clinic_resources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS buffer_before_minutes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buffer_after_minutes INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_resource ON appointments(resource_id, appointment_date);

-- 7. Patient / Client CRM Event Timelines
CREATE TABLE IF NOT EXISTS patient_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_timelines_contact ON patient_timelines(contact_id, created_at DESC);
ALTER TABLE patient_timelines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS patient_timelines_select ON patient_timelines;
CREATE POLICY patient_timelines_select ON patient_timelines FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS patient_timelines_insert ON patient_timelines;
CREATE POLICY patient_timelines_insert ON patient_timelines FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

-- 8. Treatment Plans (Dental Clinic, Aesthetic & Specialised Clinics)
CREATE TABLE IF NOT EXISTS treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'in_progress', 'completed', 'paused', 'cancelled')),
  assigned_dentist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_contact ON treatment_plans(contact_id);
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS treatment_plans_select ON treatment_plans;
CREATE POLICY treatment_plans_select ON treatment_plans FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS treatment_plans_insert ON treatment_plans;
CREATE POLICY treatment_plans_insert ON treatment_plans FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS treatment_plans_update ON treatment_plans;
CREATE POLICY treatment_plans_update ON treatment_plans FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS treatment_plans_delete ON treatment_plans;
CREATE POLICY treatment_plans_delete ON treatment_plans FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- 9. Invoices & Billing
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft', 'pending', 'paid', 'partially_paid', 'cancelled')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  due_date DATE,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_account_contact ON invoices(account_id, contact_id);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoices_select ON invoices;
CREATE POLICY invoices_select ON invoices FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS invoices_insert ON invoices;
CREATE POLICY invoices_insert ON invoices FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS invoices_update ON invoices;
CREATE POLICY invoices_update ON invoices FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS invoices_delete ON invoices;
CREATE POLICY invoices_delete ON invoices FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- 10. Super Admin Platform Configuration & CMS
CREATE TABLE IF NOT EXISTS super_admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  payment_gateway_config JSONB NOT NULL DEFAULT '{
    "razorpay_enabled": true,
    "stripe_enabled": true,
    "sandbox_mode": true
  }'::jsonb,
  landing_page_cms JSONB NOT NULL DEFAULT '{
    "hero_headline": "The Intelligent WhatsApp CRM & AI Agent Platform",
    "hero_subheadline": "Automate sales, bookings, appointments, and client workflows on official WhatsApp Business Platform.",
    "cta_text": "Start Free Trial",
    "secondary_cta": "Explore Live Demo"
  }'::jsonb,
  plan_pricing JSONB NOT NULL DEFAULT '{
    "starter": {"name": "Starter", "monthly_inr": 1999, "max_contacts": 1000, "max_members": 2, "max_locations": 1},
    "growth": {"name": "Growth", "monthly_inr": 4999, "max_contacts": 5000, "max_members": 5, "max_locations": 2},
    "pro": {"name": "Pro Business", "monthly_inr": 9999, "max_contacts": 25000, "max_members": 15, "max_locations": 5},
    "enterprise": {"name": "Enterprise", "monthly_inr": 24999, "max_contacts": 100000, "max_members": 50, "max_locations": 20}
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default row if not exists
INSERT INTO super_admin_settings (id)
VALUES ('global_config')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE super_admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS super_admin_settings_read ON super_admin_settings;
CREATE POLICY super_admin_settings_read ON super_admin_settings FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS super_admin_settings_write ON super_admin_settings;
CREATE POLICY super_admin_settings_write ON super_admin_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accounts a
      JOIN profiles p ON p.account_id = a.id
      WHERE p.user_id = auth.uid() AND p.account_role = 'owner'
    )
  );
