import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";

const status = {
  email_verified: true,
  has_channel: false,
  has_patients: false,
  pms_connected: false,
  has_subscription: false,
};

test("shows 1 done and 4 remaining with links", () => {
  render(<OnboardingChecklist status={status} dismiss={vi.fn()} />);
  expect(screen.getByText(/1.*done/i)).toBeTruthy();
  expect(screen.getByText(/4.*remaining/i)).toBeTruthy();
  expect(screen.getByRole("link", { name: /channels/i }).getAttribute("href")).toBe("/channels");
  expect(screen.getByRole("link", { name: /roster/i }).getAttribute("href")).toBe("/roster");
  expect(screen.getByRole("link", { name: /integrations/i }).getAttribute("href")).toBe("/settings/integrations");
  expect(screen.getByRole("link", { name: /billing/i }).getAttribute("href")).toBe("/billing");
});

test("dismiss button calls action", () => {
  const dismiss = vi.fn();
  render(<OnboardingChecklist status={status} dismiss={dismiss} />);
  fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
  expect(dismiss).toHaveBeenCalled();
});
