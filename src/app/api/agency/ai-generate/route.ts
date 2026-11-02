import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const body = await request.json().catch(() => null);

    const clientId = typeof body?.client_id === "string" ? body.client_id : null;
    const format = body?.format || "social_post"; // "social_post", "reel_script", "ad_copy", "blog_outline"
    const topic = typeof body?.topic === "string" ? body.topic.trim() : "New Campaign Promotion";
    const platform = body?.platform || "Instagram";

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: client, error } = await admin
      .from("agency_clients")
      .select("id, name, industry, brand_profile")
      .eq("id", clientId)
      .eq("account_id", ctx.accountId)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const brand = client.brand_profile || {};
    const brandName = brand.brand_name || client.name;
    const brandVoice = brand.brand_voice || "Professional and engaging";
    const audience = brand.target_audience || "Industry target market";
    const guidelines = brand.guidelines || "Focus on concrete value and clear call to action.";

    let generatedOutput = "";

    if (format === "reel_script") {
      generatedOutput = `### 🎬 Reel / Short-Form Video Script for ${brandName}
**Target Platform:** ${platform} | **Topic:** ${topic}
**Tone:** ${brandVoice} | **Audience:** ${audience}

---
**⚡ Hook (0-3 sec):**
"If you are still struggling with ${topic.toLowerCase()}, stop scrolling right now."

**📸 Scene 1 (3-7 sec): Visual: Fast cut showing the core problem**
*Voiceover:* "Most businesses waste time and money doing this the old way..."

**💡 Scene 2 (7-15 sec): Visual: Product or Service demonstration**
*Voiceover:* "Here is the exact framework we use at ${brandName} to get predictable results."

**🚀 Scene 3 (15-25 sec): Visual: Key benefit & social proof**
*Voiceover:* "${guidelines}"

**🎯 Call to Action (25-30 sec): Visual: Brand logo & CTA text**
*Voiceover:* "Comment 'GROW' or DM us on WhatsApp to get our free step-by-step audit!"
---
**Suggested Caption:**
Ready to transform your ${topic.toLowerCase()}? Tap the link in bio or WhatsApp us directly. 🚀
#${brandName.replace(/\s+/g, "")} #GrowthMarketing #${topic.replace(/\s+/g, "")}`;
    } else if (format === "ad_copy") {
      generatedOutput = `### 📢 Meta & Google Ad Copy Variants for ${brandName}
**Audience:** ${audience} | **Tone:** ${brandVoice}

---
**Variant A (Direct Value):**
Headline: Get Better Results from ${topic} with ${brandName}
Primary Text: Tired of wasted ad spend and low conversions? Discover our proven strategy designed specifically for ${audience}. Click below to schedule your discovery call.
CTA: Learn More / WhatsApp Us

**Variant B (Social Proof & Urgency):**
Headline: Scale Your Business with ${brandName}
Primary Text: Join hundreds of companies transforming their ${topic.toLowerCase()}. Simple pricing, verified deliverables, and dedicated support.
CTA: Book Consultation`;
    } else {
      // Standard Social Media Post & Carousel
      generatedOutput = `### 📱 Social Media Post for ${brandName}
**Platform:** ${platform} | **Topic:** ${topic}

Stop settling for average ${topic.toLowerCase()}. 

At ${brandName}, we believe ${guidelines.toLowerCase()}

Here are 3 key rules every ${audience} should follow:
1. Focus on measurable ROI before vanity metrics.
2. Automate repetitive follow-ups so no opportunity slips through.
3. Keep your brand voice consistent across every touchpoint.

Which of these are you focusing on this quarter? Let us know in the comments below! 👇

Need help scaling your strategy? Send us a WhatsApp message to get started.

#${brandName.replace(/\s+/g, "")} #DigitalSolutions #MarketingStrategy #${topic.replace(/\s+/g, "")}`;
    }

    return NextResponse.json({
      success: true,
      clientName: brandName,
      format,
      generatedOutput,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
