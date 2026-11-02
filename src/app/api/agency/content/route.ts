import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const admin = supabaseAdmin();
    let query = admin
      .from("agency_content_items")
      .select("*, client:agency_clients(id, name)")
      .eq("account_id", ctx.accountId)
      .order("publish_date", { ascending: true });

    if (clientId) query = query.eq("client_id", clientId);
    if (status && status !== "all") query = query.eq("status", status);

    const { data: content, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ content: content || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const clientId = typeof body?.client_id === "string" ? body.client_id : null;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const contentType = body?.content_type || "static_post";
    const channel = body?.channel || "instagram";
    const publishDate = body?.publish_date || new Date().toISOString().split("T")[0];
    const publishTime = body?.publish_time || "10:00";
    const caption = body?.caption || "";
    const hashtags = Array.isArray(body?.hashtags) ? body.hashtags : [];
    const cta = body?.cta || "";
    const status = body?.status || "idea";

    if (!clientId || !title) {
      return NextResponse.json({ error: "Client ID and title are required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: item, error } = await admin
      .from("agency_content_items")
      .insert({
        account_id: ctx.accountId,
        client_id: clientId,
        title,
        content_type: contentType,
        channel,
        publish_date: publishDate,
        publish_time: publishTime,
        caption,
        hashtags,
        cta,
        status,
      })
      .select("*, client:agency_clients(id, name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ content: item }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);
    const id = body?.id;
    const status = body?.status;
    const clientFeedback = body?.client_feedback;

    if (!id || !status) {
      return NextResponse.json({ error: "Content ID and status are required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (clientFeedback !== undefined) updatePayload.client_feedback = clientFeedback;

    const { data: updated, error } = await admin
      .from("agency_content_items")
      .update(updatePayload)
      .eq("id", id)
      .eq("account_id", ctx.accountId)
      .select("*, client:agency_clients(id, name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ content: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}

