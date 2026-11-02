import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();
    const admin = supabaseAdmin();

    const [
      workspacesRes,
      contactsRes,
      messagesRes,
      usersRes,
      appointmentsRes,
      automationsRes,
      settingsRes,
    ] = await Promise.all([
      admin
        .from("accounts")
        .select("id, name, business_type, subscription_tier, subscription_status, is_demo, created_at, owner_user_id"),
      admin.from("contacts").select("id", { count: "exact", head: true }),
      admin.from("messages").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id, user_id, full_name, email, role, created_at, account_id"),
      admin.from("appointments").select("id, status, appointment_date, service_name, created_at"),
      admin.from("automations").select("id, is_active", { count: "exact" }),
      admin.from("super_admin_settings").select("*").eq("id", "global_config").single(),
    ]);

    const workspaces = workspacesRes.data || [];
    const users = usersRes.data || [];
    const appointments = appointmentsRes.data || [];
    const totalContacts = contactsRes.count || 0;
    const totalMessages = messagesRes.count || 0;
    const totalAutomations = automationsRes.count || 0;
    const settings = settingsRes.data || {
      payment_gateway_config: { razorpay_enabled: true, stripe_enabled: true, sandbox_mode: true },
      landing_page_cms: {
        hero_headline: "The Intelligent WhatsApp CRM & AI Agent Platform",
        hero_subheadline: "Automate sales, bookings, appointments, and client workflows on official WhatsApp Business Platform.",
        cta_text: "Start Free Trial",
        secondary_cta: "Explore Live Demo",
      },
      plan_pricing: {
        starter: { name: "Starter", monthly_inr: 1999, max_contacts: 1000, max_members: 2, max_locations: 1 },
        growth: { name: "Growth", monthly_inr: 4999, max_contacts: 5000, max_members: 5, max_locations: 2 },
        pro: { name: "Pro Business", monthly_inr: 9999, max_contacts: 25000, max_members: 15, max_locations: 5 },
        enterprise: { name: "Enterprise", monthly_inr: 24999, max_contacts: 100000, max_members: 50, max_locations: 20 },
      },
    };

    // Calculate approximate MRR from active accounts
    const mrr = workspaces.reduce((acc, ws) => {
      if (ws.is_demo || ws.subscription_status === "canceled") return acc;
      const tier = ws.subscription_tier || "starter";
      const plan = settings.plan_pricing?.[tier];
      return acc + (plan?.monthly_inr || 1999);
    }, 0);

    return NextResponse.json({
      metrics: {
        totalWorkspaces: workspaces.length,
        totalContacts,
        totalMessages,
        totalUsers: users.length,
        totalAppointments: appointments.length,
        totalAutomations,
        mrr,
        activeTenants: workspaces.filter((w) => w.subscription_status === "active").length,
      },
      workspaces,
      users,
      appointments,
      settings,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

