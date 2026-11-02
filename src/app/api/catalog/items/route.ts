import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { seedStarterCatalog } from "@/lib/catalog/seed-catalog";
import type { BusinessType, CatalogItemType } from "@/types/business";

export async function GET(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const itemType = searchParams.get("itemType");
    const search = searchParams.get("search");

    const admin = supabaseAdmin();
    let query = admin
      .from("catalog_items")
      .select("*, category:catalog_categories(id, name)")
      .eq("account_id", ctx.accountId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    if (itemType) {
      query = query.eq("item_type", itemType);
    }
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: items, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    // Support seeding starter catalog via POST { action: "seed", businessType: "dental" }
    if (body?.action === "seed") {
      const bType: BusinessType = body?.businessType || "dental";
      await seedStarterCatalog(ctx.accountId, bType);
      return NextResponse.json({ ok: true, message: `Seeded ${bType} catalog` });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : null;
    const categoryId = typeof body?.categoryId === "string" && body.categoryId ? body.categoryId : null;
    const itemType: CatalogItemType = [
      "service",
      "product",
      "package",
      "procedure",
      "rental",
      "custom",
    ].includes(body?.item_type)
      ? body.item_type
      : "service";
    const price = typeof body?.price === "number" ? body.price : parseFloat(body?.price) || 0;
    const taxRate = typeof body?.tax_rate === "number" ? body.tax_rate : parseFloat(body?.tax_rate) || 0;
    const durationMinutes = typeof body?.duration_minutes === "number" ? body.duration_minutes : parseInt(body?.duration_minutes) || 30;
    const requiredBooking = typeof body?.required_booking === "boolean" ? body.required_booking : true;
    const customFields = body?.custom_fields && typeof body.custom_fields === "object" ? body.custom_fields : {};

    if (!name) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: item, error } = await admin
      .from("catalog_items")
      .insert({
        account_id: ctx.accountId,
        category_id: categoryId,
        name,
        description,
        item_type: itemType,
        price,
        tax_rate: taxRate,
        duration_minutes: durationMinutes,
        required_booking: requiredBooking,
        custom_fields: customFields,
        is_active: true,
      })
      .select("*, category:catalog_categories(id, name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

