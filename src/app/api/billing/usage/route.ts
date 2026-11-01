import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { getWorkspaceUsageAndPlan, SAAS_PLANS } from "@/lib/billing/plans";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();
    const result = await getWorkspaceUsageAndPlan(ctx.accountId);
    return NextResponse.json({
      ...result,
      allPlans: SAAS_PLANS,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

