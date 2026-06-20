import { describe, expect, it } from "vitest";
import { confidenceLevel, bandLabel } from "@/lib/format";

describe("confidenceLevel", () => {
  it("buckets scores", () => {
    expect(confidenceLevel(95)).toBe("high");
    expect(confidenceLevel(70)).toBe("medium");
    expect(confidenceLevel(40)).toBe("low");
    expect(confidenceLevel(null)).toBe("low");
  });
});

describe("bandLabel", () => {
  it("humanizes bands", () => {
    expect(bandLabel("auto_ready")).toBe("Auto-ready");
    expect(bandLabel("attention")).toBe("Needs attention");
    expect(bandLabel(null)).toBe("—");
  });
});
