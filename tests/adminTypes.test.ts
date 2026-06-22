import { expect, test } from "vitest";
import { AdminTenant } from "@/lib/types";

test("AdminTenant.parse succeeds", () => {
  const t = AdminTenant.parse({
    id: "t1", name: "Acme", plan: "growth", credit_balance: 500, doc_count: 42,
  });
  expect(t.name).toBe("Acme");
  expect(t.doc_count).toBe(42);
});
