import { describe, it, expect } from "vitest";
import { STARTER_CATALOGS } from "./seed-catalog";
import { getRecommendedTemplates } from "@/lib/automations/recommendation-engine";

describe("Universal Business Catalog & Starter Seeds", () => {
  it("provides complete starter catalog for Dental Clinic", () => {
    const dental = STARTER_CATALOGS.dental;
    expect(dental).toBeDefined();
    expect(dental?.categories.length).toBeGreaterThanOrEqual(4);

    const consultationCat = dental?.categories.find((c) => c.name.includes("Consultations"));
    expect(consultationCat).toBeDefined();

    const rct = dental?.categories
      .flatMap((c) => c.items)
      .find((i) => i.name.includes("Root Canal"));
    expect(rct).toBeDefined();
    expect(rct?.duration_minutes).toBe(60);
    expect(rct?.required_booking).toBe(true);
  });

  it("provides complete starter catalog for Dry Cleaning", () => {
    const dryClean = STARTER_CATALOGS.dry_cleaning;
    expect(dryClean).toBeDefined();
    const suit = dryClean?.categories
      .flatMap((c) => c.items)
      .find((i) => i.name.includes("Suit 2-Piece"));
    expect(suit).toBeDefined();
    expect(suit?.price).toBe(350);
  });

  it("provides complete starter catalog for Rental Car and Pet Shop", () => {
    expect(STARTER_CATALOGS.rental_car).toBeDefined();
    expect(STARTER_CATALOGS.pet_shop).toBeDefined();
  });

  it("provides complete starter catalog for Digital Agency and Digital Solutions", () => {
    const agency = STARTER_CATALOGS.digital_agency;
    expect(agency).toBeDefined();
    const metaAds = agency?.categories
      .flatMap((c) => c.items)
      .find((i) => i.name.includes("Meta & Instagram Ads"));
    expect(metaAds).toBeDefined();
    expect(metaAds?.price).toBe(25000);

    const solutions = STARTER_CATALOGS.digital_solutions;
    expect(solutions).toBeDefined();
    const nextjs = solutions?.categories
      .flatMap((c) => c.items)
      .find((i) => i.name.includes("Next.js"));
    expect(nextjs).toBeDefined();
    expect(nextjs?.price).toBe(85000);
  });
});

describe("Business-Aware AI Recommendation Engine", () => {
  it("ranks OPD and Appointment Reminders highest for Dental Clinics", () => {
    const recs = getRecommendedTemplates("dental");
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].template.slug).toBe("ai_opd_appointment_followup");
    expect(recs[0].badge).toContain("Dental");
  });

  it("ranks Booking Confirmation and Re-engagement highest for Laundry Services", () => {
    const recs = getRecommendedTemplates("dry_cleaning");
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].template.slug).toBe("ai_booking_confirmation");
    expect(recs[0].badge).toContain("Laundry");
  });

  it("ranks Sales Follow-up highest for Real Estate", () => {
    const recs = getRecommendedTemplates("real_estate");
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].template.slug).toBe("ai_sales_followup");
    expect(recs[0].badge).toContain("Real Estate");
  });

  it("ranks Sales Follow-up & Qualification highest for Digital Marketing Agencies", () => {
    const recs = getRecommendedTemplates("digital_agency");
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].template.slug).toBe("ai_sales_followup");
    expect(recs[0].badge).toBe("Agency Pipeline Closer");
  });
});
