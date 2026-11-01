import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { logAuditEvent } from "@/lib/audit/log";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();

  // Fetch current user's profile to know active workspace
  const { data: profile } = await admin
    .from("profiles")
    .select("account_id, account_role")
    .eq("user_id", user.id)
    .single();

  // Find all accounts where user is active in account_members or is owner
  const { data: memberships, error: memErr } = await admin
    .from("account_members")
    .select("account_id, role, status, accounts(id, name, is_demo, industry, created_at)")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (memErr) {
    console.error("[GET /api/workspaces] Error fetching memberships:", memErr);
    return NextResponse.json({ error: "Could not load workspaces" }, { status: 500 });
  }

  // Also include any account where user is owner_user_id (in case of legacy/unmapped rows)
  const { data: ownedAccounts } = await admin
    .from("accounts")
    .select("id, name, is_demo, industry, created_at")
    .eq("owner_user_id", user.id);

  const seenIds = new Set<string>();
  const workspaces: Array<{
    id: string;
    name: string;
    role: string;
    isDemo: boolean;
    industry: string;
    isActive: boolean;
    createdAt: string;
  }> = [];

  for (const m of memberships || []) {
    const acc = m.accounts as unknown as {
      id: string;
      name: string;
      is_demo: boolean;
      industry: string;
      created_at: string;
    } | null;
    if (acc && !seenIds.has(acc.id)) {
      seenIds.add(acc.id);
      workspaces.push({
        id: acc.id,
        name: acc.name,
        role: m.role,
        isDemo: !!acc.is_demo,
        industry: acc.industry || "general",
        isActive: acc.id === profile?.account_id,
        createdAt: acc.created_at,
      });
    }
  }

  for (const o of ownedAccounts || []) {
    if (!seenIds.has(o.id)) {
      seenIds.add(o.id);
      workspaces.push({
        id: o.id,
        name: o.name,
        role: "owner",
        isDemo: !!o.is_demo,
        industry: o.industry || "general",
        isActive: o.id === profile?.account_id,
        createdAt: o.created_at,
      });
    }
  }

  return NextResponse.json({ workspaces, activeAccountId: profile?.account_id });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const industry = typeof body?.industry === "string" ? body.industry.trim() : "general";

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Workspace name must be at least 2 characters" },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();

  // 1. Create account
  const { data: newAccount, error: accErr } = await admin
    .from("accounts")
    .insert({
      name,
      owner_user_id: user.id,
      industry,
      is_demo: false,
    })
    .select("id, name, industry, created_at")
    .single();

  if (accErr || !newAccount) {
    console.error("[POST /api/workspaces] Account creation error:", accErr);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }

  // 2. Add user to account_members as owner
  await admin.from("account_members").insert({
    account_id: newAccount.id,
    user_id: user.id,
    role: "owner",
    status: "active",
  });

  // 3. Switch active account in profile
  await admin
    .from("profiles")
    .update({
      account_id: newAccount.id,
      account_role: "owner",
    })
    .eq("user_id", user.id);

  // 4. Audit log
  await logAuditEvent({
    accountId: newAccount.id,
    userId: user.id,
    userEmail: user.email,
    action: "workspace.created",
    entityType: "workspace",
    entityId: newAccount.id,
    metadata: { name, industry },
  });

  return NextResponse.json({
    ok: true,
    workspace: {
      id: newAccount.id,
      name: newAccount.name,
      industry: newAccount.industry,
      role: "owner",
      isActive: true,
    },
  });
}

