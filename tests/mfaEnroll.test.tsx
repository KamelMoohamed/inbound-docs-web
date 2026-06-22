import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MfaEnroll } from "../app/(main)/settings/security/MfaEnroll";

describe("MfaEnroll", () => {
  it("renders secret and calls verify on code submit", async () => {
    const verify = vi.fn();
    render(
      <MfaEnroll setup={vi.fn()} verify={verify} disable={vi.fn()} enabled={false}
        otpauthUrl="otpauth://totp/test" secret="ABC123" />
    );
    expect(screen.getByText(/Secret: ABC123/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/verification code/i), { target: { value: "123456" } });
    fireEvent.submit(screen.getByRole("button", { name: /verify/i }).closest("form")!);
    expect(verify).toHaveBeenCalled();
  });
});
