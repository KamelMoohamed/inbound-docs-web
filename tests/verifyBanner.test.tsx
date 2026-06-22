import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { VerifyBannerInner } from "@/components/VerifyBannerInner";

test("shows banner with resend when email not verified", () => {
  render(<VerifyBannerInner emailVerified={false} />);
  expect(screen.getByText(/verify your email to unlock your trial/i)).toBeTruthy();
  expect(screen.getByRole("button", { name: /resend/i })).toBeTruthy();
});

test("hidden when email verified", () => {
  const { container } = render(<VerifyBannerInner emailVerified={true} />);
  expect(container.firstChild).toBeNull();
});
