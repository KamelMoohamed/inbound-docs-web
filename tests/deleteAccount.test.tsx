import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { DeleteAccount } from "@/components/DeleteAccount";

test("delete disabled until org name typed exactly", () => {
  const onDelete = vi.fn();
  render(<DeleteAccount orgName="Acme Clinic" onDelete={onDelete} />);
  const btn = screen.getByRole("button", { name: /delete organisation/i }) as HTMLButtonElement;
  expect(btn.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText(/type.*acme clinic/i), { target: { value: "Acme Clinic" } });
  expect(btn.disabled).toBe(false);
  fireEvent.click(btn);
  expect(onDelete).toHaveBeenCalledWith("Acme Clinic");
});
