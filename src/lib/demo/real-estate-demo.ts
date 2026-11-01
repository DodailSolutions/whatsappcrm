import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Real Estate Demo Journey Seed & Reset Engine
 *
 * Populates a realistic multi-stage real estate demonstration journey:
 * 1. New Inquiry via WhatsApp
 * 2. Automated qualification response
 * 3. Dedicated agent assignment (Alex Rivera)
 * 4. Follow-up reminder scheduling
 * 5. Deal progression from New Inquiry -> Qualified -> Site Visit -> Won ($450,000)
 */

export async function resetDemoWorkspace(
  supabase: SupabaseClient,
  accountId: string,
  userId: string,
) {
  // Verify account is demo
  const { data: acc } = await supabase
    .from("accounts")
    .select("is_demo")
    .eq("id", accountId)
    .single();

  if (!acc?.is_demo) {
    throw new Error("Cannot reset non-demo workspace.");
  }

  // 1. Delete existing deals, notes, messages, conversations, contacts
  // Clean deletion scoped to account_id
  await supabase.from("deals").delete().eq("account_id", accountId);
  await supabase.from("contact_notes").delete().eq("user_id", userId);
  await supabase.from("contact_tags").delete().eq("contact_id", accountId); // via contacts cascade
  
  // Delete conversations & messages
  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .eq("account_id", accountId);

  if (convs && convs.length > 0) {
    const convIds = convs.map((c) => c.id);
    await supabase.from("messages").delete().in("conversation_id", convIds);
    await supabase.from("conversations").delete().eq("account_id", accountId);
  }

  await supabase.from("contacts").delete().eq("account_id", accountId);

  // 2. Re-seed demo data
  return seedRealEstateDemo(supabase, accountId, userId);
}

export async function seedRealEstateDemo(
  supabase: SupabaseClient,
  accountId: string,
  userId: string,
) {
  // Ensure pipeline exists
  let pipelineId: string;
  const { data: existingPipelines } = await supabase
    .from("pipelines")
    .select("id")
    .eq("account_id", accountId)
    .limit(1);

  if (existingPipelines && existingPipelines.length > 0) {
    pipelineId = existingPipelines[0].id;
  } else {
    const { data: newPipe, error: pipeErr } = await supabase
      .from("pipelines")
      .insert({
        account_id: accountId,
        user_id: userId,
        name: "Luxury Real Estate Pipeline",
      })
      .select("id")
      .single();

    if (pipeErr) throw pipeErr;
    pipelineId = newPipe.id;
  }

  // Ensure stages exist
  const stageDefs = [
    { name: "New Inquiry", order_index: 0 },
    { name: "Qualified Lead", order_index: 1 },
    { name: "Site Visit Scheduled", order_index: 2 },
    { name: "Offer & Negotiation", order_index: 3 },
    { name: "Deal Won", order_index: 4 },
  ];

  const stageMap: Record<string, string> = {};
  const { data: existingStages } = await supabase
    .from("pipeline_stages")
    .select("id, name")
    .eq("pipeline_id", pipelineId);

  if (existingStages && existingStages.length >= 4) {
    for (const s of existingStages) {
      stageMap[s.name] = s.id;
    }
  } else {
    for (const def of stageDefs) {
      const { data: st } = await supabase
        .from("pipeline_stages")
        .insert({
          pipeline_id: pipelineId,
          name: def.name,
          order_index: def.order_index,
        })
        .select("id")
        .single();
      if (st) stageMap[def.name] = st.id;
    }
  }

  // Ensure tags exist
  const tagNames = ["High Intent", "Villa Buyer", "Penthouse", "Investor", "Commercial"];
  const tagMap: Record<string, string> = {};

  for (const name of tagNames) {
    const { data: existingTag } = await supabase
      .from("tags")
      .select("id")
      .eq("account_id", accountId)
      .eq("name", name)
      .maybeSingle();

    if (existingTag) {
      tagMap[name] = existingTag.id;
    } else {
      const { data: newTag } = await supabase
        .from("tags")
        .insert({
          account_id: accountId,
          user_id: userId,
          name,
          color: name === "High Intent" ? "#F94A00" : "#3b82f6",
        })
        .select("id")
        .single();
      if (newTag) tagMap[name] = newTag.id;
    }
  }

  // 1. Contact 1: Sarah Jenkins (The Hero Real-Estate Journey)
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  const oneHourAgo = new Date(now.getTime() - 1 * 3600 * 1000).toISOString();
  const followUpToday = new Date(now.getTime() + 4 * 3600 * 1000).toISOString();

  const { data: sarah, error: sarahErr } = await supabase
    .from("contacts")
    .insert({
      account_id: accountId,
      user_id: userId,
      name: "Sarah Jenkins",
      phone: "+15552345678",
      email: "sarah.j@jenkinsdesign.com",
      company: "Jenkins Design Studio",
      lead_source: "Website Property Inquiry",
    })
    .select("id")
    .single();

  if (sarahErr) throw sarahErr;

  // Add tags to Sarah
  if (tagMap["High Intent"]) {
    await supabase.from("contact_tags").insert({
      contact_id: sarah.id,
      tag_id: tagMap["High Intent"],
    });
  }
  if (tagMap["Villa Buyer"]) {
    await supabase.from("contact_tags").insert({
      contact_id: sarah.id,
      tag_id: tagMap["Villa Buyer"],
    });
  }

  // Internal Note for Sarah
  await supabase.from("contact_notes").insert({
    contact_id: sarah.id,
    user_id: userId,
    note_text: "Pre-approved with Chase for $500,000. Looking for handover by Q4. Family loved the video walkthrough.",
  });

  // Conversation for Sarah
  const { data: sarahConv, error: convErr } = await supabase
    .from("conversations")
    .insert({
      account_id: accountId,
      user_id: userId,
      contact_id: sarah.id,
      status: "open",
      unread_count: 0,
      last_message_text: "Congratulations Sarah! The seller has officially accepted your offer on Skyline Villa 402.",
      last_message_at: now.toISOString(),
      follow_up_at: followUpToday,
      follow_up_note: "Confirm escrow deposit receipt and notary appointment",
    })
    .select("id")
    .single();

  if (convErr) throw convErr;

  // Messages in the journey
  await supabase.from("messages").insert([
    {
      conversation_id: sarahConv.id,
      sender_type: "customer",
      content_type: "text",
      content_text: "Hi! I saw your listing for the 3BHK Skyline Villa Unit 402 on the website. Is it still available for a private walkthrough this Saturday?",
      status: "read",
      created_at: threeHoursAgo,
      is_simulated: true,
    },
    {
      conversation_id: sarahConv.id,
      sender_type: "bot",
      content_type: "text",
      content_text: "Hello Sarah! Welcome to Dodail Real Estate. Yes, Skyline Villa Unit 402 is currently available. Would 11:00 AM or 3:00 PM work best for your private walkthrough?",
      status: "delivered",
      created_at: twoHoursAgo,
      is_simulated: true,
      ai_generated: true,
    },
    {
      conversation_id: sarahConv.id,
      sender_type: "customer",
      content_type: "text",
      content_text: "11:00 AM would be perfect. We have our pre-approval ready and are looking to finalize within this month.",
      status: "read",
      created_at: oneHourAgo,
      is_simulated: true,
    },
    {
      conversation_id: sarahConv.id,
      sender_type: "agent",
      content_type: "text",
      content_text: "Wonderful Sarah! I am Alex Rivera, your dedicated property advisor. I have confirmed your private tour for Saturday at 11:00 AM. I will send your guest gate pass shortly.",
      status: "delivered",
      created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      is_simulated: true,
    },
    {
      conversation_id: sarahConv.id,
      sender_type: "agent",
      content_type: "text",
      content_text: "Congratulations Sarah! The seller has officially accepted your offer on Skyline Villa 402.",
      status: "delivered",
      created_at: now.toISOString(),
      is_simulated: true,
    },
  ]);

  // Deal for Sarah: Deal Won ($450,000)
  const wonStageId = stageMap["Deal Won"] || Object.values(stageMap)[0];
  await supabase.from("deals").insert({
    account_id: accountId,
    user_id: userId,
    pipeline_id: pipelineId,
    stage_id: wonStageId,
    contact_id: sarah.id,
    title: "Skyline Villa 3BHK Unit 402",
    value: 450000,
    status: "won",
  });

  // 2. Contact 2: Michael Chang (Penthouse Lead in Negotiation)
  const { data: michael } = await supabase
    .from("contacts")
    .insert({
      account_id: accountId,
      user_id: userId,
      name: "Michael Chang",
      phone: "+15553456789",
      email: "m.chang@apexholdings.io",
      company: "Apex Holdings",
      lead_source: "Instagram Property Ad",
    })
    .select("id")
    .single();

  if (michael) {
    if (tagMap["Penthouse"]) {
      await supabase.from("contact_tags").insert({
        contact_id: michael.id,
        tag_id: tagMap["Penthouse"],
      });
    }

    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
    const { data: mConv } = await supabase
      .from("conversations")
      .insert({
        account_id: accountId,
        user_id: userId,
        contact_id: michael.id,
        status: "open",
        unread_count: 1,
        last_message_text: "Can you send the architectural blueprints for the rooftop terrace?",
        last_message_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        follow_up_at: tomorrow,
        follow_up_note: "Send terrace engineering documents and tax structure overview",
      })
      .select("id")
      .single();

    if (mConv) {
      await supabase.from("messages").insert([
        {
          conversation_id: mConv.id,
          sender_type: "customer",
          content_type: "text",
          content_text: "Good afternoon. Can you send the architectural blueprints for the rooftop terrace on Oceanview Penthouse 18B?",
          status: "delivered",
          created_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
          is_simulated: true,
        },
      ]);
    }

    const negStageId = stageMap["Offer & Negotiation"] || wonStageId;
    await supabase.from("deals").insert({
      account_id: accountId,
      user_id: userId,
      pipeline_id: pipelineId,
      stage_id: negStageId,
      contact_id: michael.id,
      title: "Oceanview Penthouse 18B",
      value: 820000,
      status: "open",
    });
  }

  // 3. Contact 3: Priya Sharma (Commercial Investor with Overdue Follow-up)
  const { data: priya } = await supabase
    .from("contacts")
    .insert({
      account_id: accountId,
      user_id: userId,
      name: "Priya Sharma",
      phone: "+15554567890",
      email: "priya@sharmacapital.com",
      company: "Sharma Capital",
      lead_source: "Commercial Portal",
    })
    .select("id")
    .single();

  if (priya) {
    if (tagMap["Commercial"]) {
      await supabase.from("contact_tags").insert({
        contact_id: priya.id,
        tag_id: tagMap["Commercial"],
      });
    }

    const overdueTime = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
    const { data: pConv } = await supabase
      .from("conversations")
      .insert({
        account_id: accountId,
        user_id: userId,
        contact_id: priya.id,
        status: "pending",
        unread_count: 0,
        last_message_text: "Looking for 2 adjacent commercial suites in Tech District.",
        last_message_at: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
        follow_up_at: overdueTime, // OVERDUE for demonstration!
        follow_up_note: "Overdue: Review 7-year corporate lease yield projections",
      })
      .select("id")
      .single();

    if (pConv) {
      await supabase.from("messages").insert([
        {
          conversation_id: pConv.id,
          sender_type: "customer",
          content_type: "text",
          content_text: "Hi Alex, we are evaluating 2 commercial suites in the Tech District for a long-term corporate tenant.",
          status: "read",
          created_at: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
          is_simulated: true,
        },
      ]);
    }

    const siteVisitStageId = stageMap["Site Visit Scheduled"] || wonStageId;
    await supabase.from("deals").insert({
      account_id: accountId,
      user_id: userId,
      pipeline_id: pipelineId,
      stage_id: siteVisitStageId,
      contact_id: priya.id,
      title: "Tech District Commercial Floor 5",
      value: 310000,
      status: "open",
    });
  }

  return {
    success: true,
    stats: {
      contactsCreated: 3,
      conversationsCreated: 3,
      dealsCreated: 3,
      pipelineValue: 1580000,
    },
  };
}
