import { test, expect } from "@playwright/test";

// Prereq: backend + worker running, a user logged in (storageState or login step),
// and the test account has at least a starter grant. This checks the billing surface renders
// and the plan tiers + balance are visible. (Checkout itself redirects to Stripe — not asserted here.)
test("billing page shows balance and plan tiers", async ({ page }) => {
  await page.goto("/billing");
  await expect(page.getByRole("heading", { name: /billing & credits/i })).toBeVisible();
  await expect(page.getByText(/credit balance/i)).toBeVisible();
  await expect(page.getByText(/starter/i)).toBeVisible();
  await expect(page.getByText(/growth/i)).toBeVisible();
  await expect(page.getByText(/scale/i)).toBeVisible();
});
