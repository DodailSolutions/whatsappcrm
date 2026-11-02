import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();
    const admin = supabaseAdmin();

    const { data: categories, error } = await admin
      .from("catalog_categories")
      .select("*")
      .eq("account_id", ctx.accountId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : null;
    const businessType = typeof body?.business_type === "string" ? body.business_type.trim() : "general";

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: created, error } = await admin
      .from("catalog_categories")
      .insert({
        account_id: ctx.accountId,
        name,
        description,
        business_type: businessType,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: created }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

