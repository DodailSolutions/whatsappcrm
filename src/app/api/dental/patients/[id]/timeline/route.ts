import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id } = await params;

    const admin = supabaseAdmin();
    const { data: timeline, error } = await admin
      .from("patient_timelines")
      .select("*")
      .eq("account_id", ctx.accountId)
      .eq("contact_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timeline: timeline || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCurrentAccount();
    const { id } = await params;
    const body = await request.json().catch(() => null);

    const eventType = typeof body?.event_type === "string" ? body.event_type : "note_added";
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: event, error } = await admin
      .from("patient_timelines")
      .insert({
        account_id: ctx.accountId,
        contact_id: id,
        event_type: eventType,
        title,
        description,
        performed_by: ctx.userId,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

