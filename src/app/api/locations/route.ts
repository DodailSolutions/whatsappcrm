import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();
    const admin = supabaseAdmin();

    const { data: locations, error } = await admin
      .from("locations")
      .select("*")
      .eq("account_id", ctx.accountId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ locations: locations || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const address = typeof body?.address === "string" ? body.address.trim() : null;
    const phone = typeof body?.phone === "string" ? body.phone.trim() : null;
    const email = typeof body?.email === "string" ? body.email.trim() : null;
    const isPrimary = typeof body?.is_primary === "boolean" ? body.is_primary : false;

    if (!name) {
      return NextResponse.json({ error: "Location name is required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: created, error } = await admin
      .from("locations")
      .insert({
        account_id: ctx.accountId,
        name,
        address,
        phone,
        email,
        is_primary: isPrimary,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ location: created }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

