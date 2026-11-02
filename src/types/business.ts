// ============================================================
// Business & Universal Catalog Types
// Supports 14 Business Types, Multi-Location, Resources,
// Dental Clinic Module, Booking Engine, Invoicing, and SaaS Administration
// ============================================================

export type BusinessType =
  | "dental"
  | "healthcare"
  | "dry_cleaning"
  | "laundry_service"
  | "laundry_agency"
  | "rental_car"
  | "pet_shop"
  | "real_estate"
  | "ecommerce"
  | "education"
  | "hospitality"
  | "services"
  | "manufacturing"
  | "other";

export interface OperatingModel {
  // Dental specific
  dentistModel?: "single" | "multi";
  chairCount?: number;
  branchModel?: "single" | "multi";

  // Laundry / Dry Cleaning specific
  processingModel?: "in_house" | "agency";
  pickupDeliveryEnabled?: boolean;
  societiesRouteCoverage?: string;
  hasDeliveryTeam?: boolean;

  // Rental Car specific
  fleetSize?: number;
  rentalModel?: "self_drive" | "chauffeur" | "both";
  multiLocationPickup?: boolean;

  // Pet Shop specific
  petServices?: ("retail" | "grooming" | "vet" | "boarding")[];
  appointmentRequired?: boolean;

  // General / Custom
  notes?: string;
}

export type CatalogItemType =
  | "service"
  | "product"
  | "package"
  | "procedure"
  | "rental"
  | "custom";

export interface CatalogCategory {
  id: string;
  account_id: string;
  name: string;
  business_type: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  account_id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  item_type: CatalogItemType;
  price: number;
  tax_rate: number;
  duration_minutes: number;
  location_ids: string[];
  assigned_staff_ids: string[];
  required_booking: boolean;
  custom_fields: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: CatalogCategory;
}

export interface BusinessLocation {
  id: string;
  account_id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  business_hours: Record<string, { open: string; close: string; isOpen: boolean }>;
  manager_id?: string | null;
  is_primary: boolean;
  created_at: string;
}

export type ResourceType = "chair" | "room" | "equipment" | "vehicle" | "bay" | "other";

export interface ClinicResource {
  id: string;
  account_id: string;
  location_id: string;
  name: string;
  resource_type: ResourceType;
  is_active: boolean;
  created_at: string;
}

export type PatientEventType =
  | "inquiry"
  | "appointment_booked"
  | "appointment_attended"
  | "procedure_completed"
  | "prescription_issued"
  | "followup_scheduled"
  | "recall_reminder"
  | "note_added";

export interface PatientTimelineEvent {
  id: string;
  account_id: string;
  contact_id: string;
  event_type: PatientEventType;
  title: string;
  description?: string | null;
  metadata: Record<string, any>;
  performed_by?: string | null;
  created_at: string;
}

export type TreatmentPlanStatus =
  | "proposed"
  | "in_progress"
  | "completed"
  | "paused"
  | "cancelled";

export interface TreatmentPlanStage {
  id: string;
  title: string;
  cost: number;
  is_completed: boolean;
  scheduled_date?: string;
  notes?: string;
}

export interface TreatmentPlan {
  id: string;
  account_id: string;
  contact_id: string;
  title: string;
  stages: TreatmentPlanStage[];
  total_cost: number;
  paid_amount: number;
  status: TreatmentPlanStatus;
  assigned_dentist_id?: string | null;
  created_at: string;
  updated_at: string;
  contact?: { id: string; name: string; phone: string; email?: string | null } | null;
}

export type InvoiceStatus = "draft" | "pending" | "paid" | "partially_paid" | "cancelled";

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  account_id: string;
  contact_id: string;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  due_date?: string | null;
  payment_method?: string | null;
  created_at: string;
  contact?: { id: string; name: string; phone: string; email?: string | null } | null;
}

export type SaaSPlanTier = "starter" | "growth" | "pro" | "enterprise";

export interface SaaSPlanLimits {
  max_contacts: number;
  max_team_members: number;
  max_locations: number;
  max_ai_conversations: number;
  has_custom_catalog: boolean;
}

export interface SuperAdminSettings {
  id: string;
  payment_gateway_config: {
    razorpay_enabled: boolean;
    stripe_enabled: boolean;
    sandbox_mode: boolean;
    razorpay_key_id?: string;
    stripe_publishable_key?: string;
  };
  landing_page_cms: {
    hero_headline: string;
    hero_subheadline: string;
    cta_text: string;
    secondary_cta: string;
  };
  plan_pricing: Record<
    string,
    {
      name: string;
      monthly_inr: number;
      max_contacts: number;
      max_members: number;
      max_locations: number;
    }
  >;
  updated_at: string;
}

