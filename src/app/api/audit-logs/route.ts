import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  try {
    const ctx = await requireRole("admin");
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);

    const admin = supabaseAdmin();
    const { data: logs, error } = await admin
      .from("audit_logs")
      .select("id, account_id, user_id, user_email, action, entity_type, entity_id, metadata, ip_address, created_at")
      .eq("account_id", ctx.accountId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[GET /api/audit-logs] error:", error);
      return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

