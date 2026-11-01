import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { resetDemoWorkspace } from "@/lib/demo/real-estate-demo";

export async function POST() {
  try {
    const ctx = await getCurrentAccount();

    const { data: acc } = await ctx.supabase
      .from("accounts")
      .select("is_demo")
      .eq("id", ctx.accountId)
      .single();

    if (!acc?.is_demo) {
      return NextResponse.json(
        { error: "Reset is only allowed in a Demo Workspace" },
        { status: 400 }
      );
    }

    const res = await resetDemoWorkspace(ctx.supabase, ctx.accountId, ctx.userId);

    return NextResponse.json({
      ok: true,
      message: "Demo workspace reset to initial state",
      stats: res.stats,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
