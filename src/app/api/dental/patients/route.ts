import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const admin = supabaseAdmin();
    let query = admin
      .from("contacts")
      .select("id, name, phone, email, tags, created_at, updated_at, is_opted_out")
      .eq("account_id", ctx.accountId)
      .order("updated_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: patients, error } = await query.limit(50);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ patients: patients || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

