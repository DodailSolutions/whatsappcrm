import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { logAuditEvent } from "@/lib/audit/log";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();
    const admin = supabaseAdmin();
    const { data: account, error } = await admin
      .from("accounts")
      .select("id, name, industry, onboarding_completed, onboarding_step")
      .eq("id", ctx.accountId)
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to read onboarding state" }, { status: 500 });
    }

    return NextResponse.json({
      onboardingCompleted: !!account.onboarding_completed,
      onboardingStep: account.onboarding_step || 1,
      industry: account.industry || "general",
      workspaceName: account.name,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);
    const step = typeof body?.step === "number" ? body.step : undefined;
    const completed = typeof body?.completed === "boolean" ? body.completed : undefined;
    const industry = typeof body?.industry === "string" ? body.industry : undefined;

    const admin = supabaseAdmin();
    const updatePayload: Record<string, unknown> = {};

    if (step !== undefined) updatePayload.onboarding_step = step;
    if (completed !== undefined) updatePayload.onboarding_completed = completed;
    if (industry !== undefined) updatePayload.industry = industry;

    const { error } = await admin
      .from("accounts")
      .update(updatePayload)
      .eq("id", ctx.accountId);

    if (error) {
      console.error("[onboarding POST] error:", error);
      return NextResponse.json({ error: "Failed to update onboarding state" }, { status: 500 });
    }

    if (completed) {
      await logAuditEvent({
        accountId: ctx.accountId,
        userId: ctx.userId,
        action: "onboarding.completed",
        entityType: "workspace",
        entityId: ctx.accountId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}

