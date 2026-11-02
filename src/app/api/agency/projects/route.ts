import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const admin = supabaseAdmin();
    let query = admin
      .from("agency_projects")
      .select("*, client:agency_clients(id, name)")
      .eq("account_id", ctx.accountId)
      .order("created_at", { ascending: false });

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data: projects, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: projects || [] });
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
    const projectType = body?.project_type || "marketing_campaign";
    const budget = typeof body?.budget === "number" ? body.budget : parseFloat(body?.budget) || 0;
    const dueDate = body?.due_date || null;
    const description = body?.description || null;

    if (!clientId || !title) {
      return NextResponse.json({ error: "Client ID and project title are required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: project, error } = await admin
      .from("agency_projects")
      .insert({
        account_id: ctx.accountId,
        client_id: clientId,
        title,
        project_type: projectType,
        budget,
        due_date: dueDate,
        description,
        status: "in_progress",
      })
      .select("*, client:agency_clients(id, name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

