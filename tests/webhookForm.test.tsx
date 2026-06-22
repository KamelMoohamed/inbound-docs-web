import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { WebhookForm } from "@/app/(main)/settings/webhooks/WebhookForm";

test("submit disabled until valid URL and event checked", () => {
  const create = vi.fn();
  render(<WebhookForm create={create} />);
  const btn = screen.getByRole("button", { name: /create webhook/i }) as HTMLButtonElement;
  expect(btn.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText(/url/i), { target: { value: "https://hooks.example.com/incoming" } });
  expect(btn.disabled).toBe(true);
  fireEvent.click(screen.getByLabelText(/document\.filed/i));
  expect(btn.disabled).toBe(false);
});

test("shows copy field for one-time secret after create", async () => {
  const create = vi.fn().mockResolvedValue({ secret: "whsec_abc123" });
  render(<WebhookForm create={create} />);
  fireEvent.change(screen.getByLabelText(/url/i), { target: { value: "https://hooks.example.com/incoming" } });
  fireEvent.click(screen.getByLabelText(/document\.filed/i));
  fireEvent.click(screen.getByRole("button", { name: /create webhook/i }));
  expect(await screen.findByDisplayValue("whsec_abc123")).toBeTruthy();
});
