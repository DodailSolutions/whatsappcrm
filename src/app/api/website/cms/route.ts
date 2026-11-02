import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { DEFAULT_LANDING_CMS, type LandingPageCMS } from "@/lib/cms/default-landing-cms";

export async function GET() {
  try {
    const ctx = await requireRole("agent");
    const admin = supabaseAdmin();

    const { data: settings } = await admin
      .from("super_admin_settings")
      .select("landing_page_cms, landing_page_draft, landing_page_published_at, landing_page_published_by")
      .eq("id", "global_config")
      .maybeSingle();

    const { data: revisions } = await admin
      .from("landing_page_revisions")
      .select("id, title, published_by, created_at")
      .order("created_at", { ascending: false })
      .limit(15);

    const published: LandingPageCMS = {
      ...DEFAULT_LANDING_CMS,
      ...(settings?.landing_page_cms || {}),
    };

    const draft: LandingPageCMS = {
      ...published,
      ...(settings?.landing_page_draft || {}),
    };

    return NextResponse.json({
      draft,
      published,
      published_at: settings?.landing_page_published_at || null,
      revisions: revisions || [],
      can_publish: ctx.role === "owner" || ctx.role === "admin",
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireRole("admin");
    const body = await request.json().catch(() => null);
    const action = body?.action || "save_draft"; // save_draft | publish | rollback

    const admin = supabaseAdmin();

    if (action === "save_draft") {
      const draftData = body?.draft;
      if (!draftData) {
        return NextResponse.json({ error: "Missing draft data" }, { status: 400 });
      }

      const { error } = await admin
        .from("super_admin_settings")
        .upsert({
          id: "global_config",
          landing_page_draft: draftData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Draft saved successfully" });
    }

    if (action === "publish") {
      const cmsToPublish = body?.cms || body?.draft;
      if (!cmsToPublish) {
        return NextResponse.json({ error: "No content to publish" }, { status: 400 });
      }

      const now = new Date().toISOString();
      const title = body?.title || `Published on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;

      // 1. Update live published landing_page_cms and clear draft
      const { error: settingsErr } = await admin
        .from("super_admin_settings")
        .upsert({
          id: "global_config",
          landing_page_cms: cmsToPublish,
          landing_page_draft: cmsToPublish,
          landing_page_published_at: now,
          landing_page_published_by: ctx.userId,
          updated_at: now,
        });

      if (settingsErr) throw settingsErr;

      // 2. Insert into landing_page_revisions
      const { data: rev, error: revErr } = await admin
        .from("landing_page_revisions")
        .insert({
          title,
          cms_data: cmsToPublish,
          published_by: ctx.userId,
          created_at: now,
        })
        .select()
        .single();

      if (revErr) {
        console.warn("Failed to create revision log:", revErr.message);
      }

      return NextResponse.json({
        success: true,
        message: "Landing page published successfully!",
        published_at: now,
        revision: rev || null,
      });
    }

    if (action === "rollback") {
      const revisionId = body?.revision_id;
      if (!revisionId) {
        return NextResponse.json({ error: "Missing revision_id" }, { status: 400 });
      }

      const { data: rev, error: fetchErr } = await admin
        .from("landing_page_revisions")
        .select("cms_data, title")
        .eq("id", revisionId)
        .single();

      if (fetchErr || !rev?.cms_data) {
        return NextResponse.json({ error: "Revision not found" }, { status: 404 });
      }

      const now = new Date().toISOString();

      const { error: rollbackErr } = await admin
        .from("super_admin_settings")
        .upsert({
          id: "global_config",
          landing_page_cms: rev.cms_data,
          landing_page_draft: rev.cms_data,
          landing_page_published_at: now,
          landing_page_published_by: ctx.userId,
          updated_at: now,
        });

      if (rollbackErr) throw rollbackErr;

      // Log rollback as new revision
      await admin.from("landing_page_revisions").insert({
        title: `Restored: ${rev.title}`,
        cms_data: rev.cms_data,
        published_by: ctx.userId,
        created_at: now,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully rolled back to: ${rev.title}`,
        cms: rev.cms_data,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

