import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddProvider } from "../app/(main)/providers/AddProvider";

describe("AddProvider", () => {
  it("disables submit until name is non-empty", () => {
    render(<AddProvider action={vi.fn()} />);
    const submit = screen.getByRole("button", { name: /add provider/i }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/provider name/i), { target: { value: "Dr Smith" } });
    expect(submit.disabled).toBe(false);
  });
});
