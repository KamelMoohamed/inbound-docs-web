import { describe, it, expect } from "vitest";
import { tierLabel, tierTone, statusTone, capabilityLabel } from "../lib/pms";

describe("pms tier helpers", () => {
  it("labels tiers human-readably", () => {
    expect(tierLabel("write_back")).toBe("Auto-file into PMS");
    expect(tierLabel("roster")).toBe("Roster sync only");
    expect(tierLabel("export_only")).toBe("Export mode (any PMS)");
  });
  it("maps tier to a tone", () => {
    expect(tierTone("write_back")).toBe("green");
    expect(tierTone("export_only")).toBe("gray");
  });
  it("maps status to a tone", () => {
    expect(statusTone("live")).toBe("green");
    expect(statusTone("beta")).toBe("amber");
    expect(statusTone("planned")).toBe("gray");
  });
  it("labels a capability", () => {
    expect(capabilityLabel("document.write")).toBe("Files documents");
    expect(capabilityLabel("roster.read")).toBe("Syncs patient roster");
  });
});
