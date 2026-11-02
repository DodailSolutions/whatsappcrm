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
  | "digital_agency"
  | "digital_solutions"
  | "marketing_tech_agency"
  | "other";

export interface BrandProfile {
  brand_name: string;
  logo_url?: string;
  brand_voice: string;
  target_audience: string;
  customer_personas?: string;
  brand_colors: string[];
  website_urls: string[];
  social_profiles: Record<string, string>;
  guidelines: string;
  content_restrictions?: string;
  competitors?: string;
  hashtags: string[];
  goals?: string;
}

export interface OperatingModel {
  // Digital Agency & Solutions specific
  agencyModel?:
    | "solo"
    | "freelance"
    | "small_agency"
    | "full_service"
    | "software_dev"
    | "marketing_tech"
    | "white_label"
    | "multi_branch";
  agencyServices?: string[];

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

// ============================================================
// Agency Operations Module Entities
// ============================================================

export type ClientStatus =
  | "lead"
  | "prospect"
  | "onboarding"
  | "active"
  | "paused"
  | "completed"
  | "churned";

export interface AgencyClient {
  id: string;
  account_id: string;
  name: string;
  business_type?: string | null;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  address?: string | null;
  timezone: string;
  account_manager_id?: string | null;
  assigned_team_ids: string[];
  contract_start?: string | null;
  contract_end?: string | null;
  status: ClientStatus;
  purchased_service_ids: string[];
  retainer_value: number;
  billing_frequency: "monthly" | "quarterly" | "yearly" | "milestone" | "one_time";
  brand_profile: BrandProfile;
  approval_settings: {
    require_client_approval: boolean;
    approval_deadline_hours: number;
    notify_whatsapp: boolean;
  };
  onboarding_checklist: Array<{
    id: string;
    title: string;
    status: "not_started" | "in_progress" | "waiting_for_client" | "completed";
  }>;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectType =
  | "website_development"
  | "seo_campaign"
  | "social_media"
  | "paid_advertising"
  | "branding"
  | "content_production"
  | "ai_automation"
  | "crm_implementation"
  | "custom_software"
  | "marketing_campaign"
  | "other";

export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "review"
  | "completed"
  | "on_hold"
  | "cancelled";

export interface AgencyProject {
  id: string;
  account_id: string;
  client_id: string;
  title: string;
  project_type: ProjectType;
  status: ProjectStatus;
  start_date?: string | null;
  due_date?: string | null;
  budget: number;
  assigned_team_ids: string[];
  description?: string | null;
  created_at: string;
  updated_at: string;
  client?: { id: string; name: string };
}

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "waiting_for_client"
  | "approved"
  | "completed"
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface AgencyTask {
  id: string;
  account_id: string;
  project_id?: string | null;
  client_id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  owner_id?: string | null;
  due_date?: string | null;
  estimated_hours: number;
  actual_hours: number;
  client_visible: boolean;
  attachments: any[];
  created_at: string;
  updated_at: string;
  client?: { id: string; name: string };
  project?: { id: string; title: string };
}

export type ContentType =
  | "static_post"
  | "carousel"
  | "reel"
  | "short_video"
  | "story"
  | "linkedin_post"
  | "blog"
  | "email"
  | "whatsapp"
  | "other";

export type ContentChannel =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "twitter"
  | "youtube"
  | "blog"
  | "email"
  | "whatsapp"
  | "other";

export type ContentStatus =
  | "idea"
  | "planned"
  | "brief_created"
  | "in_production"
  | "internal_review"
  | "client_approval"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected"
  | "needs_revision";

export interface AgencyContentItem {
  id: string;
  account_id: string;
  client_id: string;
  project_id?: string | null;
  title: string;
  content_type: ContentType;
  channel: ContentChannel;
  publish_date?: string | null;
  publish_time?: string | null;
  creator_id?: string | null;
  reviewer_id?: string | null;
  status: ContentStatus;
  caption?: string | null;
  hashtags: string[];
  creative_assets: any[];
  cta?: string | null;
  client_feedback?: string | null;
  performance_metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
  client?: { id: string; name: string };
}

export interface AgencyProposal {
  id: string;
  account_id: string;
  client_id: string;
  title: string;
  scope_of_work?: string | null;
  deliverables: string[];
  timeline?: string | null;
  pricing_model: string;
  total_amount: number;
  payment_milestones: Array<{ name: string; amount: number; is_paid: boolean }>;
  terms?: string | null;
  status: "draft" | "sent" | "under_review" | "accepted" | "rejected" | "converted_to_project";
  created_at: string;
  updated_at: string;
  client?: { id: string; name: string };
}

