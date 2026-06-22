import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test } from "vitest";
import SignupPage from "@/app/(auth)/signup/page";

test("submit disabled until terms, privacy, and DPA are all checked", () => {
  render(<SignupPage />);
  const btn = screen.getByRole("button", { name: /create account/i }) as HTMLButtonElement;
  expect(btn.disabled).toBe(true);
  fireEvent.click(screen.getByLabelText(/terms/i));
  expect(btn.disabled).toBe(true);
  fireEvent.click(screen.getByLabelText(/privacy/i));
  expect(btn.disabled).toBe(true); // DPA still required for health data
  fireEvent.click(screen.getByLabelText(/data processing agreement/i));
  expect(btn.disabled).toBe(false);
});
