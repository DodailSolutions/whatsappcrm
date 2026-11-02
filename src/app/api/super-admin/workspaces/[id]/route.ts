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

