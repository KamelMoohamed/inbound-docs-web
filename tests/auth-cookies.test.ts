import { describe, it, expect } from "vitest";
import { cookieOptions } from "@/lib/cookieOptions";

describe("cookieOptions", () => {
  it("is secure in production", () => {
    expect(cookieOptions("production").secure).toBe(true);
    expect(cookieOptions("production").httpOnly).toBe(true);
    expect(cookieOptions("production").sameSite).toBe("lax");
  });
  it("is not secure in development (so localhost http works)", () => {
    expect(cookieOptions("development").secure).toBe(false);
  });
});
