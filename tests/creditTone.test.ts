import { describe, expect, it } from "vitest";
import { creditTone } from "@/lib/format";

describe("creditTone", () => {
  it("flags low balances", () => {
    expect(creditTone(0)).toBe("danger");
    expect(creditTone(50)).toBe("danger");     // <= 100
    expect(creditTone(300)).toBe("warn");       // <= 500
    expect(creditTone(5000)).toBe("ok");
  });
});
