import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RequestForm } from "@/app/(marketing)/integrations/request/RequestForm";

describe("RequestForm", () => {
  it("disables submit until PMS name and email are present", () => {
    render(<RequestForm action={vi.fn()} />);
    const submit = screen.getByRole("button", { name: /request/i }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/PMS name/i), { target: { value: "Zedmed" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "a@b.test" } });
    expect(submit.disabled).toBe(false);
  });
});
