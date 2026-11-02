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

    const raw = settings?.landing_page_cms || {};

    const cms: LandingPageCMS = {
      ...DEFAULT_LANDING_CMS,
      ...raw,
      sections: raw.sections?.length ? raw.sections : DEFAULT_LANDING_CMS.sections,
      navigation: {
        ...DEFAULT_LANDING_CMS.navigation,
        ...(raw.navigation || {}),
        items: raw.navigation?.items?.length ? raw.navigation.items : DEFAULT_LANDING_CMS.navigation.items,
      },
      hero: {
        ...DEFAULT_LANDING_CMS.hero,
        ...(raw.hero || {}),
        mockup: {
          ...DEFAULT_LANDING_CMS.hero.mockup,
          ...(raw.hero?.mockup || {}),
        },
        trust_points: raw.hero?.trust_points?.length ? raw.hero.trust_points : DEFAULT_LANDING_CMS.hero.trust_points,
      },
      metrics_strip: {
        ...DEFAULT_LANDING_CMS.metrics_strip,
        ...(raw.metrics_strip || {}),
        items: raw.metrics_strip?.items?.length ? raw.metrics_strip.items : DEFAULT_LANDING_CMS.metrics_strip.items,
      },
      business_types: {
        ...DEFAULT_LANDING_CMS.business_types,
        ...(raw.business_types || {}),
        filter_categories: (() => {
          const rawCats: string[] = raw.business_types?.filter_categories || [];
          if (!rawCats.length) return DEFAULT_LANDING_CMS.business_types.filter_categories;
          const set = new Set(rawCats);
          return [
            ...rawCats,
            ...DEFAULT_LANDING_CMS.business_types.filter_categories.filter(c => !set.has(c)),
          ];
        })(),
        cards: (() => {
          const rawCards = raw.business_types?.cards || [];
          if (!rawCards.length) return DEFAULT_LANDING_CMS.business_types.cards;
          const idSet = new Set(rawCards.map((c: any) => c.id));
          return [
            ...rawCards,
            ...DEFAULT_LANDING_CMS.business_types.cards.filter(c => !idSet.has(c.id)),
          ];
        })(),
      },
      features: {
        ...DEFAULT_LANDING_CMS.features,
        ...(raw.features || {}),
        cards: raw.features?.cards?.length ? raw.features.cards : DEFAULT_LANDING_CMS.features.cards,
      },
      how_it_works: {
        ...DEFAULT_LANDING_CMS.how_it_works,
        ...(raw.how_it_works || {}),
        steps: raw.how_it_works?.steps?.length ? raw.how_it_works.steps : DEFAULT_LANDING_CMS.how_it_works.steps,
      },
      outcomes: {
        ...DEFAULT_LANDING_CMS.outcomes,
        ...(raw.outcomes || {}),
        bullets: raw.outcomes?.bullets?.length ? raw.outcomes.bullets : DEFAULT_LANDING_CMS.outcomes.bullets,
        notifications: raw.outcomes?.notifications?.length
          ? raw.outcomes.notifications
          : DEFAULT_LANDING_CMS.outcomes.notifications,
      },
      faqs: {
        ...DEFAULT_LANDING_CMS.faqs,
        ...(raw.faqs || {}),
        items: raw.faqs?.items?.length ? raw.faqs.items : DEFAULT_LANDING_CMS.faqs.items,
      },
      pricing: {
        ...DEFAULT_LANDING_CMS.pricing,
        ...(raw.pricing || {}),
        plans: raw.pricing?.plans?.length ? raw.pricing.plans : DEFAULT_LANDING_CMS.pricing.plans,
      },
      final_cta: {
        ...DEFAULT_LANDING_CMS.final_cta,
        ...(raw.final_cta || {}),
      },
      footer: {
        ...DEFAULT_LANDING_CMS.footer,
        ...(raw.footer || {}),
        columns: raw.footer?.columns?.length ? raw.footer.columns : DEFAULT_LANDING_CMS.footer.columns,
        social_links: {
          ...DEFAULT_LANDING_CMS.footer.social_links,
          ...(raw.footer?.social_links || {}),
        },
      },
      seo: {
        ...DEFAULT_LANDING_CMS.seo,
        ...(raw.seo || {}),
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
