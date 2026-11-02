import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");

    const admin = supabaseAdmin();
    let query = admin
      .from("treatment_plans")
      .select("*, contact:contacts(id, name, phone)")
      .eq("account_id", ctx.accountId)
      .order("created_at", { ascending: false });

    if (contactId) {
      query = query.eq("contact_id", contactId);
    }

    const { data: plans, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: plans || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const contactId = typeof body?.contact_id === "string" ? body.contact_id : null;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const stages = Array.isArray(body?.stages) ? body.stages : [];
    const totalCost = typeof body?.total_cost === "number" ? body.total_cost : parseFloat(body?.total_cost) || 0;
    const paidAmount = typeof body?.paid_amount === "number" ? body.paid_amount : parseFloat(body?.paid_amount) || 0;
    const status = body?.status || "proposed";

    if (!contactId || !title) {
      return NextResponse.json({ error: "Contact ID and title are required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: plan, error } = await admin
      .from("treatment_plans")
      .insert({
        account_id: ctx.accountId,
        contact_id: contactId,
        title,
        stages,
        total_cost: totalCost,
        paid_amount: paidAmount,
        status,
      })
      .select("*, contact:contacts(id, name, phone)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add to patient timeline
    await admin.from("patient_timelines").insert({
      account_id: ctx.accountId,
      contact_id: contactId,
      event_type: "procedure_completed",
      title: `Treatment Plan Created: ${title}`,
      description: `Stages: ${stages.length}, Total estimated cost: ₹${totalCost}`,
      metadata: { plan_id: plan.id },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

