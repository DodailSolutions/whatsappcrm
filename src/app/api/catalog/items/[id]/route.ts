import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id } = await params;
    const body = await request.json().catch(() => null);

    const admin = supabaseAdmin();
    const updatePayload: Record<string, unknown> = {};

    if (typeof body?.name === "string") updatePayload.name = body.name.trim();
    if (typeof body?.description === "string" || body?.description === null) updatePayload.description = body.description;
    if (typeof body?.price === "number") updatePayload.price = body.price;
    if (typeof body?.tax_rate === "number") updatePayload.tax_rate = body.tax_rate;
    if (typeof body?.duration_minutes === "number") updatePayload.duration_minutes = body.duration_minutes;
    if (typeof body?.required_booking === "boolean") updatePayload.required_booking = body.required_booking;
    if (typeof body?.is_active === "boolean") updatePayload.is_active = body.is_active;
    if (body?.category_id !== undefined) updatePayload.category_id = body.category_id;
    if (body?.custom_fields !== undefined) updatePayload.custom_fields = body.custom_fields;

    const { data: updated, error } = await admin
      .from("catalog_items")
      .update(updatePayload)
      .eq("id", id)
      .eq("account_id", ctx.accountId)
      .select("*, category:catalog_categories(id, name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id } = await params;

    const admin = supabaseAdmin();
    // Soft-delete by setting is_active = false
    const { error } = await admin
      .from("catalog_items")
      .update({ is_active: false })
      .eq("id", id)
      .eq("account_id", ctx.accountId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}

