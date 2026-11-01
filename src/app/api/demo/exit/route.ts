import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find non-demo workspace owned or joined by user
  const { data: liveAcc } = await supabase
    .from("accounts")
    .select("id")
    .eq("owner_user_id", user.id)
    .eq("is_demo", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!liveAcc) {
    // If none exists, create default personal workspace
    const { data: created, error: createErr } = await supabase
      .from("accounts")
      .insert({
        name: "My Workspace",
        owner_user_id: user.id,
        is_demo: false,
      })
      .select("id")
      .single();

    if (createErr || !created) {
      return NextResponse.json({ error: "Could not restore live workspace" }, { status: 500 });
    }

    await supabase
      .from("profiles")
      .update({ account_id: created.id, account_role: "owner" })
      .eq("user_id", user.id);

    return NextResponse.json({ ok: true, accountId: created.id });
  }

  await supabase
    .from("profiles")
    .update({ account_id: liveAcc.id, account_role: "owner" })
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true, accountId: liveAcc.id });
}
