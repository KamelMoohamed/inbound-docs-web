import { describe, it, expect } from "vitest";
import { routeAfterLogin } from "@/lib/loginRoute";

describe("routeAfterLogin", () => {
  it("routes to mfa-enroll when enrollment is required", () => {
    expect(routeAfterLogin({ mfa_enrollment_required: true, enrol_token: "x" }))
      .toEqual({ kind: "enrol", token: "x" });
  });
  it("routes to mfa challenge when mfa is required", () => {
    expect(routeAfterLogin({ mfa_required: true, mfa_token: "y" }))
      .toEqual({ kind: "challenge", token: "y" });
  });
  it("routes to session when tokens are returned", () => {
    expect(routeAfterLogin({ access: "a", refresh: "r" })).toEqual({ kind: "session" });
  });
});
