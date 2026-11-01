import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { logAuditEvent } from "@/lib/audit/log";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const targetAccountId = typeof body?.accountId === "string" ? body.accountId : "";

  if (!targetAccountId) {
    return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // Verify that the user is an active member or owner of the target account
  const { data: member } = await admin
    .from("account_members")
    .select("role, status")
    .eq("account_id", targetAccountId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: account } = await admin
    .from("accounts")
    .select("id, name, owner_user_id, is_demo")
    .eq("id", targetAccountId)
    .maybeSingle();

  if (!account) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const isOwner = account.owner_user_id === user.id;

  if (!isOwner && (!member || member.status !== "active")) {
    return NextResponse.json(
      { error: "You do not have access to this workspace or your account has been deactivated." },
      { status: 403 }
    );
  }

  const newRole = isOwner ? "owner" : member?.role || "viewer";

  // Update profiles row to switch active workspace
  const { error: updateErr } = await admin
    .from("profiles")
    .update({
      account_id: targetAccountId,
      account_role: newRole,
    })
    .eq("user_id", user.id);

  if (updateErr) {
    console.error("[POST /api/workspaces/switch] Profile update error:", updateErr);
    return NextResponse.json({ error: "Failed to switch workspace" }, { status: 500 });
  }

  // Audit log
  await logAuditEvent({
    accountId: targetAccountId,
    userId: user.id,
    userEmail: user.email,
    action: "workspace.switched",
    entityType: "workspace",
    entityId: targetAccountId,
    metadata: { workspaceName: account.name },
  });

  return NextResponse.json({
    ok: true,
    activeAccountId: targetAccountId,
    role: newRole,
    name: account.name,
  });
}

