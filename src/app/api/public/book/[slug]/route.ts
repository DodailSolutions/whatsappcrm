import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { checkSlotAvailability, bookAppointment, generateTimeSlots } from "@/lib/booking/booking-engine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const admin = supabaseAdmin();
    // Find account by booking_slug or id
    let { data: account, error: accErr } = await admin
      .from("accounts")
      .select("id, name, business_type, booking_slug")
      .or(`booking_slug.eq.${slug},id.eq.${slug}`)
      .maybeSingle();

    if (accErr || !account) {
      // Fallback: use first active account so the public page can preview immediately
      const { data: firstAcc } = await admin
        .from("accounts")
        .select("id, name, business_type, booking_slug")
        .limit(1)
        .maybeSingle();
      if (!firstAcc) {
        return NextResponse.json({ error: "Booking page not found" }, { status: 404 });
      }
      account = firstAcc;
    }

    const [itemsRes, locationsRes, bookedRes] = await Promise.all([
      admin
        .from("catalog_items")
        .select("id, name, description, item_type, price, duration_minutes, required_booking")
        .eq("account_id", account.id)
        .eq("is_active", true)
        .eq("required_booking", true),
      admin
        .from("locations")
        .select("id, name, address, phone")
        .eq("account_id", account.id),
      admin
        .from("appointments")
        .select("appointment_time, duration_minutes")
        .eq("account_id", account.id)
        .eq("appointment_date", date)
        .in("status", ["pending", "confirmed"]),
    ]);

    const catalogItems = itemsRes.data || [];
    const locations = locationsRes.data || [];
    const bookedTimes = new Set((bookedRes.data || []).map((b) => b.appointment_time));

    const allSlots = generateTimeSlots(9, 18, 45);
    const availableSlots = allSlots.map((slot) => ({
      time: slot,
      isAvailable: !bookedTimes.has(slot),
    }));

    return NextResponse.json({
      workspace: {
        id: account.id,
        name: account.name,
        businessType: account.business_type || "general",
        slug: account.booking_slug || slug,
      },
      catalogItems,
      locations,
      slots: availableSlots,
      date,
    });
  } catch (err: any) {
    console.error("[public booking GET error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load booking page" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => null);

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : null;
    const serviceName = typeof body?.serviceName === "string" ? body.serviceName.trim() : "General Consultation";
    const catalogItemId = typeof body?.catalogItemId === "string" ? body.catalogItemId : null;
    const appointmentDate = typeof body?.appointmentDate === "string" ? body.appointmentDate : "";
    const appointmentTime = typeof body?.appointmentTime === "string" ? body.appointmentTime : "";
    const notes = typeof body?.notes === "string" ? body.notes.trim() : null;

    if (!name || !phone || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Name, phone, date, and time slot are required." },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();
    // Find account by booking_slug or id
    let { data: account } = await admin
      .from("accounts")
      .select("id, name")
      .or(`booking_slug.eq.${slug},id.eq.${slug}`)
      .maybeSingle();

    if (!account) {
      const { data: firstAcc } = await admin.from("accounts").select("id, name").limit(1).maybeSingle();
      if (!firstAcc) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
      account = firstAcc;
    }

    // 1. Find or create Contact in this workspace
    let { data: contact } = await admin
      .from("contacts")
      .select("id")
      .eq("account_id", account.id)
      .eq("phone", phone)
      .maybeSingle();

    if (!contact) {
      const { data: newContact, error: cErr } = await admin
        .from("contacts")
        .insert({
          account_id: account.id,
          name,
          phone,
          email,
          lead_source: "online_booking",
        })
        .select("id")
        .single();

      if (cErr || !newContact) {
        return NextResponse.json({ error: "Failed to create contact record" }, { status: 500 });
      }
      contact = newContact;
    }

    // 2. Book appointment with double-booking check
    const bookingResult = await bookAppointment({
      accountId: account.id,
      contactId: contact.id,
      serviceName,
      catalogItemId,
      appointmentDate,
      appointmentTime,
      notes,
      enforceAvailability: true,
    });

    if (!bookingResult.success) {
      return NextResponse.json({ error: bookingResult.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      appointment: bookingResult.appointment,
      message: `Your appointment for ${serviceName} on ${appointmentDate} at ${appointmentTime} is confirmed!`,
    });
  } catch (err: any) {
    console.error("[public booking POST error]:", err);
    return NextResponse.json({ error: err.message || "Failed to process booking" }, { status: 500 });
  }
}

