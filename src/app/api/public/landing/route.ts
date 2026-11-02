import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { DEFAULT_LANDING_CMS, type LandingPageCMS } from "@/lib/cms/default-landing-cms";

export async function GET() {
  try {
    const admin = supabaseAdmin();
    const { data: settings } = await admin
      .from("super_admin_settings")
      .select("landing_page_cms, plan_pricing")
      .eq("id", "global_config")
      .maybeSingle();

    const cms: LandingPageCMS = {
      ...DEFAULT_LANDING_CMS,
      ...(settings?.landing_page_cms || {}),
      hero: {
        ...DEFAULT_LANDING_CMS.hero,
        ...(settings?.landing_page_cms?.hero || {}),
      },
      stats: settings?.landing_page_cms?.stats?.length
        ? settings.landing_page_cms.stats
        : DEFAULT_LANDING_CMS.stats,
      case_studies_section: {
        ...DEFAULT_LANDING_CMS.case_studies_section,
        ...(settings?.landing_page_cms?.case_studies_section || {}),
        items: settings?.landing_page_cms?.case_studies_section?.items?.length
          ? settings.landing_page_cms.case_studies_section.items
          : DEFAULT_LANDING_CMS.case_studies_section.items,
      },
      faqs_section: {
        ...DEFAULT_LANDING_CMS.faqs_section,
        ...(settings?.landing_page_cms?.faqs_section || {}),
        items: settings?.landing_page_cms?.faqs_section?.items?.length
          ? settings.landing_page_cms.faqs_section.items
          : DEFAULT_LANDING_CMS.faqs_section.items,
      },
    };

    return NextResponse.json({
      cms,
      pricing: settings?.plan_pricing || null,
    });
  } catch (err: any) {
    console.error("[public landing API error]:", err);
    return NextResponse.json({ cms: DEFAULT_LANDING_CMS, pricing: null });
  }
}

