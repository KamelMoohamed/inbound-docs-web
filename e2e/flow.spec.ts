import { test, expect } from "@playwright/test";

// Prereq: backend + worker running, tenant seeded, a roster imported, and at least
// one document uploaded and processed into needs_review before running this.
test("staff can review and confirm a document", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /documents to review/i })).toBeVisible();
  const open = page.getByRole("link", { name: /open/i }).first();
  await open.click();
  await expect(page).toHaveURL(/\/review\//);
  await page.getByRole("button", { name: /confirm & file/i }).click();
  await expect(page).toHaveURL("http://localhost:3000/");
});
