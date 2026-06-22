import { describe, it, expect } from "vitest";
import { SUB_PROCESSORS } from "@/lib/sub-processors";

describe("sub-processor list", () => {
  it("includes Anthropic and AWS with locations", () => {
    const names = SUB_PROCESSORS.map((s) => s.name);
    expect(names).toContain("Anthropic");
    expect(names).toContain("AWS");
    expect(SUB_PROCESSORS.every((s) => s.location && s.purpose)).toBe(true);
  });
});
