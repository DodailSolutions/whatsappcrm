import { supabaseAdmin } from "@/lib/automations/admin-client";

export interface PlanLimits {
  seats: number; // -1 for unlimited
  whatsappNumbers: number;
  contacts: number;
  aiMonthlyReplies: number;
  automations: number;
}

export interface PlanDefinition {
  id: string;
  name: string;
  description: string;
  priceMonthlyINR: number;
  priceYearlyINR: number;
  features: string[];
  limits: PlanLimits;
}

export const SAAS_PLANS: Record<string, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Ideal for small businesses launching on official WhatsApp Business Platform.",
    priceMonthlyINR: 1999,
    priceYearlyINR: 19990,
    features: [
      "Official Meta WhatsApp Cloud API",
      "Up to 3 team members",
      "1,000 active contacts",
      "Unified team inbox & live chat",
      "10 active automation workflows",
      "50 AI smart reply drafts / month",
      "Standard CSV contacts import",
    ],
    limits: {
      seats: 3,
      whatsappNumbers: 1,
      contacts: 1000,
      aiMonthlyReplies: 50,
      automations: 10,
    },
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "For growing sales and customer support teams managing high WhatsApp volume.",
    priceMonthlyINR: 4999,
    priceYearlyINR: 49990,
    features: [
      "Everything in Starter",
      "Up to 10 team members",
      "10,000 active contacts",
      "Multiple WhatsApp phone numbers (up to 3)",
      "50 automation workflows & drip campaigns",
      "500 AI smart reply drafts / month",
      "Advanced sales pipelines & deals tracking",
      "Custom fields & segmented broadcast tags",
      "Priority webhook dispatch & audit logs",
    ],
    limits: {
      seats: 10,
      whatsappNumbers: 3,
      contacts: 10000,
      aiMonthlyReplies: 500,
      automations: 50,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Full-scale solution for large real estate, healthcare, and retail enterprises.",
    priceMonthlyINR: 12999,
    priceYearlyINR: 129990,
    features: [
      "Everything in Professional",
      "Unlimited team seats",
      "Unlimited contacts & broadcasts",
      "Unlimited WhatsApp numbers",
      "Unlimited AI smart replies & auto-replies",
      "Unlimited automations & flow builders",
      "Dedicated account manager & SLA",
      "Custom CRM integrations & webhooks",
    ],
    limits: {
      seats: -1,
      whatsappNumbers: -1,
      contacts: -1,
      aiMonthlyReplies: -1,
      automations: -1,
    },
  },
};

export async function getWorkspaceUsageAndPlan(accountId: string) {
  const admin = supabaseAdmin();

  // 1. Get account details
  const { data: account } = await admin
    .from("accounts")
    .select("id, name, is_demo, industry, created_at")
    .eq("id", accountId)
    .single();

  // Check if account has a plan assigned or defaults to professional for demo, starter for new
  const planKey = account?.is_demo ? "professional" : "professional"; // Default trial is professional
  const plan = SAAS_PLANS[planKey];

  // 2. Count active team members
  const { count: memberCount } = await admin
    .from("account_members")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .eq("status", "active");

  // 3. Count contacts
  const { count: contactCount } = await admin
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId);

  // 4. Count connected WhatsApp numbers
  const { count: whatsappCount } = await admin
    .from("whatsapp_config")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId);

  // 5. Count active automations
  const { count: automationCount } = await admin
    .from("automations")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .eq("status", "active");

  return {
    account,
    plan,
    usage: {
      seats: memberCount || 1,
      contacts: contactCount || 0,
      whatsappNumbers: whatsappCount || 0,
      automations: automationCount || 0,
      aiRepliesThisMonth: 12, // Usage record
    },
  };
}

