import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { SsoButton } from "@/components/SsoButton";

test("redirects to SSO authorize with email domain", () => {
  const assign = vi.fn();
  vi.stubGlobal("location", { ...window.location, assign });
  render(<SsoButton />);
  fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: "jane@acme.com" } });
  fireEvent.click(screen.getByRole("button", { name: /sign in with sso/i }));
  expect(assign).toHaveBeenCalledWith("/auth/sso/authorize?domain=acme.com");
  vi.unstubAllGlobals();
});
