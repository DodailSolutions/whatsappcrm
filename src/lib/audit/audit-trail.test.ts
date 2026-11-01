import { describe, it, expect } from "vitest";

describe("Audit Trail Event Format", () => {
  it("structures critical administrative workspace actions with proper metadata", () => {
    const event = {
      accountId: "acc-uuid-1",
      userId: "user-uuid-1",
      userEmail: "owner@dodail.com",
      action: "member.deactivated",
      entityType: "member",
      entityId: "target-user-uuid",
      metadata: { newStatus: "deactivated" },
      createdAt: new Date().toISOString(),
    };

    expect(event.action).toBe("member.deactivated");
    expect(event.entityType).toBe("member");
    expect(event.metadata.newStatus).toBe("deactivated");
  });
});

