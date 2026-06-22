import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => ({
  publicApi: {
    verifyEmail: vi.fn(async () => undefined),
  },
}));

import { verifyEmail, verifyEmailError } from "@/lib/verifyEmail";
import { publicApi } from "@/lib/api";

describe("verifyEmail", () => {
  beforeEach(() => vi.mocked(publicApi.verifyEmail).mockReset());

  it("returns success when token verifies", async () => {
    vi.mocked(publicApi.verifyEmail).mockImplementation(async () => undefined);
    const result = await verifyEmail("tok123");
    expect(publicApi.verifyEmail).toHaveBeenCalledWith("tok123");
    expect(result).toEqual({ ok: true });
  });

  it("returns error when verification fails", () => {
    expect(verifyEmailError()).toEqual({ error: "Verification link is invalid or expired." });
  });
});
