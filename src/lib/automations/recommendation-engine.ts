import type { BusinessType, OperatingModel } from "@/types/business";
import { getAllAiFollowupTemplates, type AIFollowupTemplate } from "@/lib/automations/ai-followup-templates";

export interface TemplateRecommendation {
  template: AIFollowupTemplate;
  relevanceScore: number;
  badge: string;
  reason: string;
}

/**
 * Recommends optimal AI sales and follow-up templates tailored to the workspace's
 * business type and operating model.
 */
export function getRecommendedTemplates(
  businessType: BusinessType,
  operatingModel?: OperatingModel
): TemplateRecommendation[] {
  const recommendations: TemplateRecommendation[] = [];
  const templates = getAllAiFollowupTemplates();

  for (const template of templates) {
    let score = 50;
    let badge = "Recommended";
    let reason = "Standard multi-channel follow-up";

    switch (businessType) {
      case "dental":
        if (template.slug === "ai_opd_appointment_followup") {
          score = 100;
          badge = "Top Fit for Dental";
          reason = "Automates patient consultations, dental chair booking, and intake confirmation.";
        } else if (template.slug === "ai_appointment_reminder") {
          score = 95;
          badge = "Essential";
          reason = "Sends timely reminder with chair sanitization buffer and cancellation link.";
        } else if (template.slug === "ai_lead_qualification") {
          score = 90;
          badge = "High Impact";
          reason = "Qualifies cosmetic dentistry, implants, and orthodontic aligner inquiries.";
        }
        break;

      case "healthcare":
        if (template.slug === "ai_opd_appointment_followup") {
          score = 100;
          badge = "OPD Core";
          reason = "Follows up on specialist outpatient consultations and doctor slot reservations.";
        } else if (template.slug === "ai_patient_admin_followup") {
          score = 95;
          badge = "Top Fit";
          reason = "Gathers insurance pre-authorizations and administrative intake documents.";
        }
        break;

      case "dry_cleaning":
      case "laundry_service":
      case "laundry_agency":
        if (template.slug === "ai_booking_confirmation") {
          score = 95;
          badge = "Top Fit for Laundry";
          reason = "Confirms doorstep society pickup slots and delivery dispatch schedules.";
        } else if (template.slug === "ai_unresponsive_reengagement") {
          score = 90;
          badge = "Retention Booster";
          reason = "Re-engages residential customers after 3 weeks of inactivity with discount offers.";
        }
        break;

      case "rental_car":
        if (template.slug === "ai_booking_confirmation") {
          score = 95;
          badge = "Fleet Essential";
          reason = "Confirms vehicle availability, deposit instructions, and driver license intake.";
        } else if (template.slug === "ai_quote_followup") {
          score = 90;
          badge = "Sales Accelerator";
          reason = "Follows up on tariff quotations for luxury and long-distance SUV rentals.";
        }
        break;

      case "pet_shop":
        if (template.slug === "ai_booking_confirmation") {
          score = 95;
          badge = "Spa Booking";
          reason = "Schedules grooming bay sessions and veterinary health check appointments.";
        }
        break;

      case "real_estate":
        if (template.slug === "ai_sales_followup") {
          score = 100;
          badge = "Top Fit for Real Estate";
          reason = "Drives property buyers from initial brochure download to scheduled site visits.";
        } else if (template.slug === "ai_lead_qualification") {
          score = 95;
          badge = "Lead Filter";
          reason = "Extracts buyer budget, unit BHK preference, and possession timeline.";
        }
        break;

      default:
        if (template.slug === "ai_sales_followup") {
          score = 85;
          badge = "Universal";
          reason = "Standard high-conversion sales follow-up journey.";
        }
        break;
    }

    recommendations.push({
      template,
      relevanceScore: score,
      badge,
      reason,
    });
  }

  // Sort by highest score first
  return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
