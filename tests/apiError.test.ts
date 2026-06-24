import { describe, it, expect } from "vitest";
import { messageFromApiBody } from "@/lib/apiError";

describe("messageFromApiBody", () => {
  it("reads FastAPI detail string", () => {
    expect(messageFromApiBody(400, '{"detail":"Email must be verified before checkout."}', "POST", "/billing/checkout"))
      .toBe("Email must be verified before checkout.");
  });

  it("reads error field", () => {
    expect(messageFromApiBody(400, '{"error":"Already subscribed"}', "POST", "/billing/checkout"))
      .toBe("Already subscribed");
  });

  it("falls back to status when body is empty", () => {
    expect(messageFromApiBody(400, "", "POST", "/billing/checkout"))
      .toBe("POST /billing/checkout failed (400)");
  });
});
