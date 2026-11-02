import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");

    const admin = supabaseAdmin();
    let query = admin
      .from("invoices")
      .select("*, contact:contacts(id, name, phone)")
      .eq("account_id", ctx.accountId)
      .order("created_at", { ascending: false });

    if (contactId) {
      query = query.eq("contact_id", contactId);
    }

    const { data: invoices, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoices: invoices || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const contactId = typeof body?.contact_id === "string" ? body.contact_id : null;
    const items = Array.isArray(body?.items) ? body.items : [];
    const subtotal = typeof body?.subtotal === "number" ? body.subtotal : parseFloat(body?.subtotal) || 0;
    const taxAmount = typeof body?.tax_amount === "number" ? body.tax_amount : parseFloat(body?.tax_amount) || 0;
    const totalAmount = typeof body?.total_amount === "number" ? body.total_amount : parseFloat(body?.total_amount) || 0;
    const status = body?.status || "pending";
    const paymentMethod = body?.payment_method || "UPI / Cash";

    if (!contactId || items.length === 0) {
      return NextResponse.json({ error: "Contact ID and items are required" }, { status: 400 });
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const admin = supabaseAdmin();

    const { data: invoice, error } = await admin
      .from("invoices")
      .insert({
        account_id: ctx.accountId,
        contact_id: contactId,
        invoice_number: invoiceNumber,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status,
        items,
        payment_method: paymentMethod,
        due_date: new Date().toISOString().split("T")[0],
      })
      .select("*, contact:contacts(id, name, phone)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add invoice generated to patient timeline
    await admin.from("patient_timelines").insert({
      account_id: ctx.accountId,
      contact_id: contactId,
      event_type: "procedure_completed",
      title: `Dental Invoice Issued: ${invoiceNumber}`,
      description: `Amount: ₹${totalAmount} (${status})`,
      metadata: { invoice_id: invoice.id },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

