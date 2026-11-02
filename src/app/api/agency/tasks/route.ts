import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const admin = supabaseAdmin();
    let query = admin
      .from("agency_tasks")
      .select("*, client:agency_clients(id, name), project:agency_projects(id, title)")
      .eq("account_id", ctx.accountId)
      .order("created_at", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);
    if (projectId) query = query.eq("project_id", projectId);
    if (status && status !== "all") query = query.eq("status", status);

    const { data: tasks, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const clientId = typeof body?.client_id === "string" ? body.client_id : null;
    const projectId = typeof body?.project_id === "string" ? body.project_id : null;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description = body?.description || null;
    const priority = body?.priority || "medium";
    const status = body?.status || "todo";
    const dueDate = body?.due_date || null;
    const estimatedHours = typeof body?.estimated_hours === "number" ? body.estimated_hours : parseFloat(body?.estimated_hours) || 0;

    if (!clientId || !title) {
      return NextResponse.json({ error: "Client ID and task title are required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: task, error } = await admin
      .from("agency_tasks")
      .insert({
        account_id: ctx.accountId,
        client_id: clientId,
        project_id: projectId,
        title,
        description,
        priority,
        status,
        due_date: dueDate,
        estimated_hours: estimatedHours,
      })
      .select("*, client:agency_clients(id, name), project:agency_projects(id, title)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task }, { status: 201 });
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

    if (!id || !status) {
      return NextResponse.json({ error: "Task ID and status are required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: updated, error } = await admin
      .from("agency_tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("account_id", ctx.accountId)
      .select("*, client:agency_clients(id, name), project:agency_projects(id, title)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}
