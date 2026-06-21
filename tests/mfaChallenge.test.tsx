import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MfaChallenge } from "../app/(auth)/login/MfaChallenge";

describe("MfaChallenge", () => {
  it("submits code with mfaToken", () => {
    const submit = vi.fn();
    render(<MfaChallenge mfaToken="tok123" submit={submit} />);
    fireEvent.change(screen.getByLabelText(/mfa code/i), { target: { value: "654321" } });
    fireEvent.submit(screen.getByRole("button", { name: /verify/i }).closest("form")!);
    expect(submit).toHaveBeenCalled();
    const fd = submit.mock.calls[0][0] as FormData;
    expect(fd.get("mfaToken")).toBe("tok123");
    expect(fd.get("code")).toBe("654321");
  });
});
