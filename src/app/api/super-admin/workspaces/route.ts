import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { logAuditEvent } from "@/lib/audit/log";

// GET /api/super-admin/workspaces
export async function GET() {
  try {
    await getCurrentAccount();
    const admin = supabaseAdmin();

    const { data: workspaces, error } = await admin
      .from("accounts")
      .select("id, name, business_type, subscription_tier, subscription_status, is_demo, created_at, owner_user_id")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workspaces: workspaces || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/super-admin/workspaces
// Creates a new workspace / tenant directly from Super Admin
export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const {
      name,
      business_type = "general",
      subscription_tier = "growth",
      subscription_status = "active",
      owner_user_id,
    } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const admin = supabaseAdmin();

    const { data: newAccount, error } = await admin
      .from("accounts")
      .insert({
        name: name.trim(),
        business_type,
        subscription_tier,
        subscription_status,
        owner_user_id: owner_user_id || ctx.userId,
      })
      .select()
      .single();

    if (error || !newAccount) {
      return NextResponse.json(
        { error: error?.message || "Failed to create workspace" },
        { status: 500 }
      );
    }

    // Attach creator/owner as owner in account_members
    await admin.from("account_members").insert({
      account_id: newAccount.id,
      user_id: owner_user_id || ctx.userId,
      role: "owner",
      status: "active",
    });

    await logAuditEvent({
      accountId: newAccount.id,
      userId: ctx.userId,
      action: "super_admin.workspace_created",
      entityType: "workspace",
      entityId: newAccount.id,
      metadata: { name, business_type, subscription_tier },
    });

    return NextResponse.json({ workspace: newAccount });
  } catch (err) {
    return toErrorResponse(err);
  }
}
