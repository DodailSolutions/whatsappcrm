import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const admin = supabaseAdmin();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body?.payment_gateway_config) {
      updatePayload.payment_gateway_config = body.payment_gateway_config;
    }
    if (body?.landing_page_cms) {
      updatePayload.landing_page_cms = body.landing_page_cms;
    }
    if (body?.plan_pricing) {
      updatePayload.plan_pricing = body.plan_pricing;
    }

    const { data: updated, error } = await admin
      .from("super_admin_settings")
      .upsert({ id: "global_config", ...updatePayload })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}

