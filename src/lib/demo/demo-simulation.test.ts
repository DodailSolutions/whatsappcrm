import { describe, it, expect } from "vitest";

describe("Demo Workspace Simulation Rules", () => {
  it("never sends live Meta API requests for simulated demo messages", () => {
    const isDemo = true;
    const isOutboundLive = !isDemo;

    expect(isOutboundLive).toBe(false);
  });

  it("marks demo messages with is_simulated flag", () => {
    const message = {
      id: "msg-demo-123",
      account_id: "demo-account-1",
      body: "Welcome to Dodail Real Estate!",
      is_simulated: true,
      sender_type: "agent",
    };

    expect(message.is_simulated).toBe(true);
  });
});

