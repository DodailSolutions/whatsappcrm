// ============================================================
// /api/account/members/[userId]
//
//   PATCH  — change a member's role.   Admin+.
//   DELETE — remove a member.          Admin+.
//
// Both delegate to SECURITY DEFINER RPCs from migration 018:
//   - set_member_role(p_user_id, p_new_role)
//   - remove_account_member(p_user_id)
//
// The RPCs do the *real* authorisation work — caller must be
// admin+, target must be in caller's account, target can't be the
// owner, can't be self. The TS layer here only forwards the call
// and maps Postgres SQLSTATEs back to HTTP statuses.
// ============================================================

import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { isAccountRole } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/audit/log";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { getT } from "@/lib/i18n/translate";

const t = getT("Api");

// Map known SQLSTATEs from the RPCs (see migration 018) onto HTTP
// statuses. The `error.code` field is the SQLSTATE; the `message`
// is the human-readable RAISE message we put in the migration.
function rpcErrorToResponse(err: PostgrestError): NextResponse {
  if (err.code === "42501") {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  if (err.code === "22023") {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  console.error("[members route] unexpected RPC error:", err);
  return NextResponse.json(
    { error: t('account.members.updateFailed') },
    { status: 500 },
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const ctx = await requireRole("admin");

    const limit = checkRateLimit(
      `admin:memberRole:${ctx.userId}`,
      RATE_LIMITS.adminAction,
    );
    if (!limit.success) return rateLimitResponse(limit);

    const { userId } = await params;

    const body = (await request.json().catch(() => null)) as
      | { role?: unknown; status?: unknown }
      | null;
    const role = body?.role;
    const status = body?.status;

    const admin = supabaseAdmin();

    // 1. Status update (deactivate / reactivate)
    if (status === "active" || status === "deactivated") {
      if (userId === ctx.userId) {
        return NextResponse.json(
          { error: "Cannot change your own membership status" },
          { status: 400 }
        );
      }

      const { data: targetAccount } = await admin
        .from("accounts")
        .select("owner_user_id")
        .eq("id", ctx.accountId)
        .single();

      if (targetAccount?.owner_user_id === userId) {
        return NextResponse.json(
          { error: "Cannot deactivate workspace owner" },
          { status: 400 }
        );
      }

      const { error: statusErr } = await admin
        .from("account_members")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("account_id", ctx.accountId)
        .eq("user_id", userId);

      if (statusErr) {
        console.error("[members PATCH] status error:", statusErr);
        return NextResponse.json({ error: "Failed to update member status" }, { status: 500 });
      }

      await logAuditEvent({
        accountId: ctx.accountId,
        userId: ctx.userId,
        action: status === "deactivated" ? "member.deactivated" : "member.reactivated",
        entityType: "member",
        entityId: userId,
        metadata: { newStatus: status },
      });

      if (!role) {
        return NextResponse.json({ ok: true, status });
      }
    }

    if (role !== undefined) {
      if (!isAccountRole(role)) {
        return NextResponse.json(
          { error: t('account.members.roleInvalid') },
          { status: 400 },
        );
      }

      // The RPC blocks promotion to / demotion from owner, but
      // surface the friendlier 400 before crossing the wire too.
      if (role === "owner") {
        return NextResponse.json(
          {
            error:
              t('account.members.useTransferOwnership'),
          },
          { status: 400 },
        );
      }

      const { error } = await ctx.supabase.rpc("set_member_role", {
        p_user_id: userId,
        p_new_role: role,
      });

      if (error) return rpcErrorToResponse(error);

      // Keep account_members in sync
      await admin
        .from("account_members")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("account_id", ctx.accountId)
        .eq("user_id", userId);

      await logAuditEvent({
        accountId: ctx.accountId,
        userId: ctx.userId,
        action: "member.role_changed",
        entityType: "member",
        entityId: userId,
        metadata: { newRole: role },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const ctx = await requireRole("admin");

    const limit = checkRateLimit(
      `admin:memberRemove:${ctx.userId}`,
      RATE_LIMITS.adminAction,
    );
    if (!limit.success) return rateLimitResponse(limit);

    const { userId } = await params;

    const { data, error } = await ctx.supabase.rpc("remove_account_member", {
      p_user_id: userId,
    });

    if (error) return rpcErrorToResponse(error);

    // Delete from account_members
    const admin = supabaseAdmin();
    await admin
      .from("account_members")
      .delete()
      .eq("account_id", ctx.accountId)
      .eq("user_id", userId);

    await logAuditEvent({
      accountId: ctx.accountId,
      userId: ctx.userId,
      action: "member.removed",
      entityType: "member",
      entityId: userId,
    });

    return NextResponse.json({ ok: true, newPersonalAccountId: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
