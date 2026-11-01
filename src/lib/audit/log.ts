import { supabaseAdmin } from "@/lib/automations/admin-client";

export interface LogAuditEventParams {
  accountId: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditEvent({
  accountId,
  userId,
  userEmail,
  action,
  entityType,
  entityId,
  metadata = {},
  ipAddress,
  userAgent,
}: LogAuditEventParams): Promise<void> {
  try {
    const admin = supabaseAdmin();
    await admin.from("audit_logs").insert({
      account_id: accountId,
      user_id: userId || null,
      user_email: userEmail || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });
  } catch (err) {
    // Non-blocking: audit logs should never crash the main user request
    console.error("[audit_log] Failed to write audit event:", err);
  }
}

