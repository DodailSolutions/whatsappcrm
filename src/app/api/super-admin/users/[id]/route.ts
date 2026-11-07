import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { logAuditEvent } from "@/lib/audit/log";

// PATCH /api/super-admin/users/[id]
// Updates user profile, role, account, status, or resets password
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id: userId } = await params;
    const body = await request.json().catch(() => null);

    const { full_name, role, account_id, status, password } = body || {};

    const admin = supabaseAdmin();

    // 1. Password update if provided
    if (password && typeof password === "string" && password.length >= 6) {
      await admin.auth.admin.updateUserById(userId, { password });
    }

    // 2. Profile update
    const profileUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name) profileUpdates.full_name = full_name;
    if (role) {
      profileUpdates.account_role = role;
      profileUpdates.role = role === "owner" || role === "admin" ? "admin" : "user";
    }
    if (account_id) profileUpdates.account_id = account_id;

    await admin.from("profiles").update(profileUpdates).eq("user_id", userId);

    // 3. Account members update
    if (account_id || role || status) {
      const memberUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (role) memberUpdates.role = role;
      if (status) memberUpdates.status = status;

      if (account_id) {
        await admin
          .from("account_members")
          .update(memberUpdates)
          .eq("user_id", userId)
          .eq("account_id", account_id);
      } else {
        await admin
          .from("account_members")
          .update(memberUpdates)
          .eq("user_id", userId);
      }
    }

    await logAuditEvent({
      accountId: account_id || ctx.accountId,
      userId: ctx.userId,
      action: "super_admin.user_updated",
      entityType: "user",
      entityId: userId,
      metadata: { full_name, role, account_id, status },
    });

    return NextResponse.json({ ok: true, message: "User updated successfully" });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/super-admin/users/[id]
// Deletes a user completely from Auth and database
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id: userId } = await params;

    if (userId === ctx.userId) {
      return NextResponse.json(
        { error: "Cannot delete your own super admin account" },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    // 1. Delete from account_members
    await admin.from("account_members").delete().eq("user_id", userId);

    // 2. Delete from profiles
    await admin.from("profiles").delete().eq("user_id", userId);

    // 3. Delete from Supabase Auth
    const { error: authErr } = await admin.auth.admin.deleteUser(userId);
    if (authErr) {
      console.warn("[super-admin/users DELETE] Auth delete warning:", authErr.message);
    }

    await logAuditEvent({
      accountId: ctx.accountId,
      userId: ctx.userId,
      action: "super_admin.user_deleted",
      entityType: "user",
      entityId: userId,
    });

    return NextResponse.json({ ok: true, message: "User deleted successfully" });
  } catch (err) {
    return toErrorResponse(err);
  }
}
