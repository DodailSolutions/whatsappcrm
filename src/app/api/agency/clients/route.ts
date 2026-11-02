import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const admin = supabaseAdmin();
    let query = admin
      .from("agency_clients")
      .select("*")
      .eq("account_id", ctx.accountId)
      .order("updated_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: clients, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ clients: clients || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const industry = typeof body?.industry === "string" ? body.industry.trim() : "General";
    const contactName = typeof body?.contact_name === "string" ? body.contact_name.trim() : null;
    const email = typeof body?.email === "string" ? body.email.trim() : null;
    const phone = typeof body?.phone === "string" ? body.phone.trim() : null;
    const website = typeof body?.website === "string" ? body.website.trim() : null;
    const retainerValue = typeof body?.retainer_value === "number" ? body.retainer_value : parseFloat(body?.retainer_value) || 0;
    const billingFrequency = body?.billing_frequency || "monthly";
    const status = body?.status || "active";

    if (!name) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    const defaultChecklist = [
      { id: "1", title: "Signed Service Agreement / Proposal", status: "completed" },
      { id: "2", title: "Brand Assets (Vector Logo, Color Palette)", status: "in_progress" },
      { id: "3", title: "Meta Business Manager / Google Ads Access", status: "waiting_for_client" },
      { id: "4", title: "Target Audience & Competitor Brief", status: "not_started" },
      { id: "5", title: "Project Kickoff & Strategy Call", status: "not_started" },
    ];

    const defaultBrandProfile = {
      brand_name: name,
      brand_voice: body?.brand_voice || "Professional, authoritative, and customer-centric",
      target_audience: body?.target_audience || "B2B & High-Intent Consumers",
      brand_colors: ["#111827", "#F15A22"],
      website_urls: website ? [website] : [],
      social_profiles: {},
      guidelines: body?.guidelines || "Highlight ROI, transparency, and quick turnaround.",
      hashtags: [],
    };

    const admin = supabaseAdmin();
    const { data: client, error } = await admin
      .from("agency_clients")
      .insert({
        account_id: ctx.accountId,
        name,
        industry,
        contact_name: contactName,
        email,
        phone,
        website,
        retainer_value: retainerValue,
        billing_frequency: billingFrequency,
        status,
        brand_profile: defaultBrandProfile,
        onboarding_checklist: defaultChecklist,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ client }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

