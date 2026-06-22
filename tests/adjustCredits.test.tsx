import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { AdjustCredits } from "@/components/AdjustCredits";

test("submit disabled until amount and reason provided", () => {
  const adjust = vi.fn();
  render(<AdjustCredits adjust={adjust} />);
  const btn = screen.getByRole("button", { name: /adjust credits/i }) as HTMLButtonElement;
  expect(btn.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "100" } });
  expect(btn.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: "Goodwill" } });
  expect(btn.disabled).toBe(false);
  fireEvent.submit(btn.closest("form")!);
  expect(adjust).toHaveBeenCalled();
});
