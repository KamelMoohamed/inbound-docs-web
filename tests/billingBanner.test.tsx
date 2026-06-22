import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { BillingBannerInner } from "@/components/BillingBannerInner";

test("amber banner when past due with future grace", () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  render(<BillingBannerInner past_due={true} grace_until={future} />);
  expect(screen.getByText(/payment failed/i)).toBeTruthy();
  expect(screen.getByRole("link", { name: /update payment/i })).toBeTruthy();
});

test("red banner when grace expired", () => {
  const past = new Date(Date.now() - 86400000).toISOString();
  render(<BillingBannerInner past_due={true} grace_until={past} />);
  expect(screen.getByText(/processing paused/i)).toBeTruthy();
});

test("nothing when not past due", () => {
  const { container } = render(<BillingBannerInner past_due={false} grace_until={null} />);
  expect(container.firstChild).toBeNull();
});
