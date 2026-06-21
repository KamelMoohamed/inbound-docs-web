import { test, expect } from "@playwright/test";

// Prereq: backend + worker running, one org seeded via /auth/signup (or this test does it).
test("staff can log in, review and confirm a document", async ({ page }) => {
  // Sign up (creates a fresh org each run; ok in dev — the backend truncates between runs)
  await page.goto("/signup");
  await page.fill('[name=orgName]', 'Test Clinic');
  await page.fill('[name=name]', 'Owner');
  await page.fill('[name=email]', 'owner@test.clinic');
  await page.fill('[name=password]', 'pw-12345678');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL("http://localhost:3000/");
  await expect(page.getByRole("heading", { name: /documents to review/i })).toBeVisible();

  // Logout and log back in
  await page.click("button:has-text('Logout')");
  await expect(page).toHaveURL(/\/login/);
  await page.fill('[name=email]', 'owner@test.clinic');
  await page.fill('[name=password]', 'pw-12345678');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL("http://localhost:3000/");
});
