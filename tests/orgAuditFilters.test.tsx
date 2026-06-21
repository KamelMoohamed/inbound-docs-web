import { describe, it, expect } from "vitest";
import { buildOrgAuditQuery } from "../lib/reportFormat";

describe("orgAuditFilters", () => {
  it("emits selected type and date range", () => {
    expect(buildOrgAuditQuery({ from: "2026-06-01", to: "2026-06-21", type: "login", actor: "u1" }))
      .toBe("from=2026-06-01&to=2026-06-21&type=login&actor=u1");
  });
});
