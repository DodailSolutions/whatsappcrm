import { describe, it, expect, vi } from "vitest";
import { checkSlotAvailability, generateTimeSlots } from "./booking-engine";

// Mock supabaseAdmin with full chainable query
vi.mock("@/lib/automations/admin-client", () => {
  const createChainable = () => {
    const chain: any = {
      eq: () => chain,
      in: () => chain,
      select: () => chain,
      then: (resolve: any) => resolve({ data: [], error: null }),
    };
    return chain;
  };

  return {
    supabaseAdmin: () => ({
      from: () => createChainable(),
    }),
  };
});

describe("Booking Availability & Resource Engine", () => {
  it("reports slot available when no conflicting appointments exist", async () => {
    const res = await checkSlotAvailability({
      accountId: "test-account-123",
      appointmentDate: "2026-11-15",
      appointmentTime: "14:00",
      serviceName: "Comprehensive Dental Exam",
    });

    expect(res.isAvailable).toBe(true);
    expect(res.message).toContain("is available for booking");
  });

  it("generates correct time slots within working hours with buffer", () => {
    const slots = generateTimeSlots(9, 12, 60);
    expect(slots).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("handles 45-minute dental appointment intervals", () => {
    const slots = generateTimeSlots(10, 12, 45);
    expect(slots).toEqual(["10:00", "10:45"]);
  });
});
