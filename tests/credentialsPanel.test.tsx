import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { CredentialsPanel } from "@/components/CredentialsPanel";

test("permanent detail (no secret) → no one-time warning", () => {
  render(<CredentialsPanel setup={{ kind: "email", instructions: "Forward here.", fields: { "Forwarding address": "docs-a@inbound.test" } }} />);
  expect(screen.getByDisplayValue("docs-a@inbound.test")).toBeTruthy();
  expect(screen.queryByText(/shown once/i)).toBeNull();
});

test("contains a secret → shows the one-time warning", () => {
  render(<CredentialsPanel setup={{ kind: "hl7", instructions: "POST here.", fields: { "Endpoint URL": "https://x/y", "Bearer token": "tok_abc" } }} />);
  expect(screen.getByText(/shown once/i)).toBeTruthy();
});
