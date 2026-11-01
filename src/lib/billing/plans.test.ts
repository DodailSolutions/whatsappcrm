import { describe, it, expect, vi } from "vitest";
import { SAAS_PLANS } from "@/lib/billing/plans";

describe("SaaS Plans and Limits Configuration", () => {
  it("defines standard SaaS plans with non-hardcoded tiered limits", () => {
    expect(SAAS_PLANS.starter).toBeDefined();
    expect(SAAS_PLANS.professional).toBeDefined();
    expect(SAAS_PLANS.enterprise).toBeDefined();

    expect(SAAS_PLANS.starter.limits.seats).toBe(3);
    expect(SAAS_PLANS.starter.limits.contacts).toBe(1000);

    expect(SAAS_PLANS.professional.limits.seats).toBe(10);
    expect(SAAS_PLANS.professional.limits.contacts).toBe(10000);

    expect(SAAS_PLANS.enterprise.limits.seats).toBe(-1); // Unlimited
    expect(SAAS_PLANS.enterprise.limits.contacts).toBe(-1); // Unlimited
  });

  it("calculates annual discount correctly for professional plan", () => {
    const monthlyRate = SAAS_PLANS.professional.priceMonthlyINR * 12;
    const yearlyRate = SAAS_PLANS.professional.priceYearlyINR;
    expect(yearlyRate).toBeLessThan(monthlyRate);
  });
});

