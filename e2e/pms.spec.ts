import { test, expect } from "@playwright/test";

test("public catalog lists supported PMSes and links to request", async ({ page }) => {
  await page.goto("/integrations");
  await expect(page.getByRole("heading", { name: /supported practice software/i })).toBeVisible();
  await expect(page.getByText("Cliniko")).toBeVisible();
  await expect(page.getByText(/export mode/i)).toBeVisible();
  await page.getByRole("link", { name: /request it/i }).click();
  await expect(page.getByRole("heading", { name: /request a pms integration/i })).toBeVisible();
});

test("request form submits and shows confirmation", async ({ page }) => {
  await page.goto("/integrations/request");
  await page.getByLabel(/PMS name/i).fill("Zedmed");
  await page.getByLabel(/email/i).fill("lead@clinic.test");
  await page.getByRole("button", { name: /request this pms/i }).click();
  await expect(page.getByText(/we've logged your request/i)).toBeVisible();
});
