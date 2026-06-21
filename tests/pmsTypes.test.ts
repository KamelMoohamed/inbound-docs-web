// tests/pmsTypes.test.ts
import { describe, it, expect } from "vitest";
import { PmsCatalogEntry, PmsConnectionStatus, StuckDoc } from "../lib/types";

describe("PMS types", () => {
  it("parses a catalog entry", () => {
    const e = PmsCatalogEntry.parse({ key: "cliniko", display_name: "Cliniko", segment: "allied",
      hosting: "cloud", tier: "write_back", capabilities: ["roster.read", "document.write"], status: "beta" });
    expect(e.tier).toBe("write_back");
  });
  it("parses a not-connected status", () => {
    expect(PmsConnectionStatus.parse({ connected: false }).connected).toBe(false);
  });
  it("parses a connected status", () => {
    const s = PmsConnectionStatus.parse({ connected: true, pmsType: "cliniko", authKind: "api_key",
      status: "connected", capabilities: ["document.write"], lastRosterSyncAt: null, lastError: null });
    expect(s.pmsType).toBe("cliniko");
  });
  it("parses a stuck doc", () => {
    const d = StuckDoc.parse({ id: "1", doc_type: "pathology", write_back_status: "failed",
      write_back_attempts: 2, write_back_error: "boom", updated_at: "2026-06-21T00:00:00Z" });
    expect(d.write_back_status).toBe("failed");
  });
});
