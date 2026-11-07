import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { logAuditEvent } from "@/lib/audit/log";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id } = await params;
    const body = await request.json().catch(() => null);

    const admin = supabaseAdmin();
    const updatePayload: Record<string, unknown> = {};

    if (typeof body?.name === "string" && body.name.trim()) {
      updatePayload.name = body.name.trim();
    }
    if (typeof body?.business_type === "string") {
      updatePayload.business_type = body.business_type;
    }
    if (typeof body?.subscription_status === "string") {
      updatePayload.subscription_status = body.subscription_status;
    }
    if (typeof body?.subscription_tier === "string") {
      updatePayload.subscription_tier = body.subscription_tier;
    }

    const { data: updated, error } = await admin
      .from("accounts")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAuditEvent({
      accountId: id,
      userId: ctx.userId,
      action: "super_admin.workspace_updated",
      entityType: "workspace",
      entityId: id,
      metadata: updatePayload,
    });

    return NextResponse.json({ workspace: updated });
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

    if (id === ctx.accountId) {
      return NextResponse.json(
        { error: "Cannot delete the active workspace you are currently in" },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    const { error } = await admin.from("accounts").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAuditEvent({
      accountId: ctx.accountId,
      userId: ctx.userId,
      action: "super_admin.workspace_deleted",
      entityType: "workspace",
      entityId: id,
    });

    return NextResponse.json({ ok: true, message: "Workspace deleted successfully" });
  } catch (err) {
    return toErrorResponse(err);
  }
}
