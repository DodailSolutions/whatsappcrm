import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id } = await params;

    const admin = supabaseAdmin();
    const [clientRes, projectsRes, tasksRes, contentRes] = await Promise.all([
      admin
        .from("agency_clients")
        .select("*")
        .eq("id", id)
        .eq("account_id", ctx.accountId)
        .single(),
      admin
        .from("agency_projects")
        .select("*")
        .eq("client_id", id)
        .eq("account_id", ctx.accountId)
        .order("created_at", { ascending: false }),
      admin
        .from("agency_tasks")
        .select("*")
        .eq("client_id", id)
        .eq("account_id", ctx.accountId)
        .order("due_date", { ascending: true }),
      admin
        .from("agency_content_items")
        .select("*")
        .eq("client_id", id)
        .eq("account_id", ctx.accountId)
        .order("publish_date", { ascending: false }),
    ]);

    if (clientRes.error || !clientRes.data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      client: clientRes.data,
      projects: projectsRes.data || [],
      tasks: tasksRes.data || [],
      content: contentRes.data || [],
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id } = await params;
    const body = await request.json().catch(() => null);

    const admin = supabaseAdmin();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body?.name === "string") updatePayload.name = body.name.trim();
    if (typeof body?.status === "string") updatePayload.status = body.status;
    if (typeof body?.retainer_value === "number") updatePayload.retainer_value = body.retainer_value;
    if (body?.brand_profile) updatePayload.brand_profile = body.brand_profile;
    if (body?.onboarding_checklist) updatePayload.onboarding_checklist = body.onboarding_checklist;
    if (typeof body?.notes === "string" || body?.notes === null) updatePayload.notes = body.notes;

    const { data: updated, error } = await admin
      .from("agency_clients")
      .update(updatePayload)
      .eq("id", id)
      .eq("account_id", ctx.accountId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ client: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id } = await params;

    const admin = supabaseAdmin();
    const { error } = await admin
      .from("agency_clients")
      .update({ status: "churned" })
      .eq("id", id)
      .eq("account_id", ctx.accountId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
