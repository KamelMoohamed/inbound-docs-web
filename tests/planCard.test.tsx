import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { PlanCard } from "@/components/PlanCard";

test("renders plan name, price, credits, and CTA label", () => {
  render(<PlanCard planKey="growth" monthlyCredits={5000} current={false} />);
  expect(screen.getAllByText(/growth/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/5,000 credits/i)).toBeTruthy();
  expect(screen.getByRole("button", { name: /choose growth/i })).toBeTruthy();
});

test("shows 'current plan' and disables the button when current", () => {
  render(<PlanCard planKey="starter" monthlyCredits={2000} current={true} />);
  expect(screen.getByText(/current plan/i)).toBeTruthy();
  expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
});
