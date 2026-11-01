import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { seedRealEstateDemo } from "@/lib/demo/real-estate-demo";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Check if user already has an existing demo workspace
  const { data: existingDemo } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("owner_user_id", user.id)
    .eq("is_demo", true)
    .maybeSingle();

  let demoAccountId: string;

  if (existingDemo) {
    demoAccountId = existingDemo.id;
  } else {
    // Create new demo workspace
    const { data: newDemo, error: createErr } = await supabase
      .from("accounts")
      .insert({
        name: "Dodail Real Estate Demo",
        owner_user_id: user.id,
        is_demo: true,
        industry: "real_estate",
      })
      .select("id")
      .single();

    if (createErr || !newDemo) {
      console.error("[demo/enter] create account error:", createErr);
      return NextResponse.json(
        { error: "Could not create demo workspace" },
        { status: 500 }
      );
    }

    demoAccountId = newDemo.id;

    // Seed the demo dataset
    try {
      await seedRealEstateDemo(supabase, demoAccountId, user.id);
    } catch (seedErr) {
      console.error("[demo/enter] seed error:", seedErr);
    }
  }

  // 2. Set user active account to demo account
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      account_id: demoAccountId,
      account_role: "owner",
    })
    .eq("user_id", user.id);

  if (profileErr) {
    console.error("[demo/enter] switch profile error:", profileErr);
    return NextResponse.json(
      { error: "Could not switch to demo workspace" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    accountId: demoAccountId,
    message: "Entered demo workspace successfully",
  });
}
