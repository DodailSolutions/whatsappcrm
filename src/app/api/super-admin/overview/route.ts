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
      profilesRes,
      membersRes,
      appointmentsRes,
      automationsRes,
      settingsRes,
    ] = await Promise.all([
      admin
        .from("accounts")
        .select("id, name, business_type, subscription_tier, subscription_status, is_demo, created_at, owner_user_id")
        .order("created_at", { ascending: false }),
      admin.from("contacts").select("id, account_id"),
      admin.from("messages").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id, user_id, full_name, email, role, account_role, created_at, account_id, avatar_url"),
      admin.from("account_members").select("id, account_id, user_id, role, status"),
      admin.from("appointments").select("id, status, appointment_date, service_name, created_at"),
      admin.from("automations").select("id, is_active", { count: "exact" }),
      admin.from("super_admin_settings").select("*").eq("id", "global_config").single(),
    ]);

    const rawWorkspaces = workspacesRes.data || [];
    const profiles = profilesRes.data || [];
    const members = membersRes.data || [];
    const contacts = contactsRes.data || [];
    const appointments = appointmentsRes.data || [];
    const totalContacts = contactsRes.data ? contactsRes.data.length : 0;
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

    // Index contacts per workspace
    const contactCountMap = new Map<string, number>();
    for (const c of contacts) {
      if (c.account_id) {
        contactCountMap.set(c.account_id, (contactCountMap.get(c.account_id) || 0) + 1);
      }
    }

    // Index members per workspace
    const memberCountMap = new Map<string, number>();
    const memberStatusMap = new Map<string, { role: string; status: string }>();
    for (const m of members) {
      if (m.account_id) {
        memberCountMap.set(m.account_id, (memberCountMap.get(m.account_id) || 0) + 1);
        memberStatusMap.set(`${m.account_id}:${m.user_id}`, { role: m.role, status: m.status });
      }
    }

    const accountsMap = new Map(rawWorkspaces.map((w) => [w.id, w]));

    const workspaces = rawWorkspaces.map((ws) => ({
      ...ws,
      total_contacts: contactCountMap.get(ws.id) || 0,
      total_members: memberCountMap.get(ws.id) || 0,
    }));

    const users = profiles.map((p) => {
      const ws = p.account_id ? accountsMap.get(p.account_id) : null;
      const mem = p.account_id ? memberStatusMap.get(`${p.account_id}:${p.user_id}`) : null;

      return {
        id: p.user_id,
        user_id: p.user_id,
        full_name: p.full_name || "Unnamed User",
        email: p.email || "No email",
        role: mem?.role || p.account_role || p.role || "agent",
        account_id: p.account_id,
        workspace_name: ws?.name || "Unassigned",
        business_type: ws?.business_type || "general",
        plan: ws?.subscription_tier || "starter",
        status: mem?.status || (ws?.subscription_status === "suspended" ? "suspended" : "active"),
        avatar_url: p.avatar_url,
        created_at: p.created_at,
      };
    });

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
