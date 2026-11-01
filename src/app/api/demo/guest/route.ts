import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { seedRealEstateDemo } from "@/lib/demo/real-estate-demo";

const DEMO_EMAIL = "demo@dodail.com";
const DEMO_PASSWORD = "DodailDemoAccess2026!";

export async function POST() {
  const admin = supabaseAdmin();

  // 1. Check if demo user exists, if not create it
  const { data: usersList } = await admin.auth.admin.listUsers();
  let demoUser = usersList?.users?.find((u) => u.email === DEMO_EMAIL);

  if (!demoUser) {
    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: "Demo Explorer",
      },
    });

    if (createErr || !newUser.user) {
      console.error("[demo/guest] Failed to create demo user:", createErr);
      return NextResponse.json({ error: "Could not initialize demo account" }, { status: 500 });
    }
    demoUser = newUser.user;
  }

  // 2. Sign in the demo user via server client so cookies are written to response
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (signInErr) {
    // If password mismatch, update password via admin API and retry
    await admin.auth.admin.updateUserById(demoUser.id, { password: DEMO_PASSWORD });
    const { error: retryErr } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    if (retryErr) {
      console.error("[demo/guest] Sign in failed:", retryErr);
      return NextResponse.json({ error: "Failed to sign into demo session" }, { status: 500 });
    }
  }

  // 3. Find or create demo account
  const { data: existingDemo } = await admin
    .from("accounts")
    .select("id")
    .eq("owner_user_id", demoUser.id)
    .eq("is_demo", true)
    .maybeSingle();

  let demoAccountId: string;

  if (existingDemo) {
    demoAccountId = existingDemo.id;
  } else {
    const { data: newAcc, error: accErr } = await admin
      .from("accounts")
      .insert({
        name: "Dodail Real Estate Demo",
        owner_user_id: demoUser.id,
        is_demo: true,
        industry: "real_estate",
      })
      .select("id")
      .single();

    if (accErr || !newAcc) {
      console.error("[demo/guest] Failed to create demo account:", accErr);
      return NextResponse.json({ error: "Failed to create demo workspace" }, { status: 500 });
    }
    demoAccountId = newAcc.id;

    // Seed real estate demo data
    try {
      await seedRealEstateDemo(admin, demoAccountId, demoUser.id);
    } catch (err) {
      console.error("[demo/guest] Seed error:", err);
    }
  }

  // 4. Update profile to point to demo account
  await admin
    .from("profiles")
    .update({
      account_id: demoAccountId,
      account_role: "owner",
    })
    .eq("user_id", demoUser.id);

  return NextResponse.json({
    ok: true,
    redirect: "/dashboard",
  });
}

