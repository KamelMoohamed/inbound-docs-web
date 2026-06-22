import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { SsoForm } from "@/app/(main)/settings/sso/SsoForm";

const config = { domain: "acme.com", issuer: "https://idp/acme", client_id: "client-1", enabled: true };

test("pre-fills fields and client secret is empty", () => {
  render(<SsoForm config={config} save={vi.fn()} />);
  expect((screen.getByLabelText(/domain/i) as HTMLInputElement).value).toBe("acme.com");
  expect((screen.getByLabelText(/issuer/i) as HTMLInputElement).value).toBe("https://idp/acme");
  expect((screen.getByLabelText(/client id/i) as HTMLInputElement).value).toBe("client-1");
  expect((screen.getByLabelText(/client secret/i) as HTMLInputElement).value).toBe("");
});

test("submit calls save action", () => {
  const save = vi.fn();
  render(<SsoForm config={config} save={save} />);
  fireEvent.change(screen.getByLabelText(/client secret/i), { target: { value: "secret" } });
  fireEvent.submit(screen.getByRole("button", { name: /save/i }).closest("form")!);
  expect(save).toHaveBeenCalled();
});
