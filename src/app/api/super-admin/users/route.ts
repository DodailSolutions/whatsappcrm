import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { logAuditEvent } from "@/lib/audit/log";

// GET /api/super-admin/users
// Lists all users across all accounts with workspace & profile metadata
export async function GET() {
  try {
    await getCurrentAccount();
    const admin = supabaseAdmin();

    const [profilesRes, accountsRes, membersRes, authUsersRes] = await Promise.all([
      admin.from("profiles").select("id, user_id, full_name, email, role, account_role, account_id, created_at, avatar_url"),
      admin.from("accounts").select("id, name, business_type, subscription_tier, subscription_status"),
      admin.from("account_members").select("id, account_id, user_id, role, status, created_at"),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }).catch(() => ({ data: { users: [] }, error: null })),
    ]);

    const accountsMap = new Map((accountsRes.data || []).map((a) => [a.id, a]));
    const membersMap = new Map((membersRes.data || []).map((m) => [`${m.account_id}:${m.user_id}`, m]));
    const authMap = new Map((authUsersRes.data?.users || []).map((u) => [u.id, u]));

    const users = (profilesRes.data || []).map((p) => {
      const account = p.account_id ? accountsMap.get(p.account_id) : null;
      const member = p.account_id ? membersMap.get(`${p.account_id}:${p.user_id}`) : null;
      const authUser = authMap.get(p.user_id);

      return {
        id: p.user_id,
        profile_id: p.id,
        user_id: p.user_id,
        full_name: p.full_name || "Unnamed User",
        email: p.email || authUser?.email || "No email",
        role: member?.role || p.account_role || p.role || "agent",
        account_id: p.account_id,
        workspace_name: account?.name || "Unassigned",
        business_type: account?.business_type || "general",
        plan: account?.subscription_tier || "starter",
        status: member?.status || (account?.subscription_status === "suspended" ? "suspended" : "active"),
        avatar_url: p.avatar_url,
        created_at: p.created_at || authUser?.created_at,
        last_sign_in_at: authUser?.last_sign_in_at || null,
      };
    });

    return NextResponse.json({ users });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/super-admin/users
// Super admin creates a new user, sets credentials, attaches to workspace
export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const { email, password, full_name, role = "agent", account_id } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || email.split("@")[0],
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create user in Auth" },
        { status: 400 }
      );
    }

    const newUserId = authData.user.id;
    const targetAccountId = account_id || ctx.accountId;

    // 2. Insert or update profile
    const { data: profileData, error: profileError } = await admin
      .from("profiles")
      .upsert(
        {
          user_id: newUserId,
          full_name: full_name || email.split("@")[0],
          email,
          role: role === "owner" || role === "admin" ? "admin" : "user",
          account_role: role,
          account_id: targetAccountId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (profileError) {
      console.error("[super-admin/users] Profile upsert error:", profileError);
    }

    // 3. Insert into account_members
    if (targetAccountId) {
      await admin
        .from("account_members")
        .upsert(
          {
            account_id: targetAccountId,
            user_id: newUserId,
            role,
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "account_id,user_id" }
        );
    }

    await logAuditEvent({
      accountId: targetAccountId || ctx.accountId,
      userId: ctx.userId,
      action: "super_admin.user_created",
      entityType: "user",
      entityId: newUserId,
      metadata: { email, full_name, role, account_id: targetAccountId },
    });

    return NextResponse.json({
      user: {
        id: newUserId,
        user_id: newUserId,
        email,
        full_name: full_name || email.split("@")[0],
        role,
        account_id: targetAccountId,
        status: "active",
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
