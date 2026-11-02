import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();
    const admin = supabaseAdmin();

    const { data: config } = await admin
      .from("ai_sales_agent_configs")
      .select("id, account_id")
      .eq("account_id", ctx.accountId)
      .maybeSingle();

    return NextResponse.json({
      isConnected: false,
      integration: "google_calendar",
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=GOOGLE_CLIENT_ID&redirect_uri=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_SITE_URL || "https://crm.example.com"}/api/integrations/google-calendar/callback`
      )}&response_type=code&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&state=${ctx.accountId}`,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    // Formats appointment into Google Calendar event format
    const eventPayload = {
      summary: body?.service_name || "Client Appointment",
      description: `Client: ${body?.client_name || "Customer"}\nPhone: ${body?.client_phone || ""}\nNotes: ${body?.notes || ""}`,
      start: {
        dateTime: `${body?.appointment_date}T${body?.appointment_time}:00`,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: `${body?.appointment_date}T${body?.appointment_time}:00`,
        timeZone: "Asia/Kolkata",
      },
    };

    return NextResponse.json({
      success: true,
      googleCalendarEvent: eventPayload,
      message: "Synced event to Google Calendar format",
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

