import { describe, it, expect } from "vitest";
import { formatRate, formatTurnaround, buildOrgAuditQuery } from "../lib/reportFormat";

describe("reportFormat", () => {
  it("formats rate as percentage", () => {
    expect(formatRate(0.037)).toBe("3.7%");
  });
  it("formats turnaround", () => {
    expect(formatTurnaround(5400)).toBe("1h 30m");
  });
});

describe("buildOrgAuditQuery", () => {
  it("builds query string from filters", () => {
    expect(buildOrgAuditQuery({ from: "2026-06-01", to: "2026-06-21", type: "login" }))
      .toBe("from=2026-06-01&to=2026-06-21&type=login");
  });
});
