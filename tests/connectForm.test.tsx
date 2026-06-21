import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectForm } from "../app/(main)/settings/integrations/ConnectForm";

const catalog = [
  { key: "cliniko", display_name: "Cliniko", authKind: "api_key" as const },
  { key: "halaxy", display_name: "Halaxy", authKind: "oauth2" as const },
];

describe("ConnectForm", () => {
  it("shows an API-key field when an api_key PMS is selected", () => {
    render(<ConnectForm options={catalog} connectApiKey={vi.fn()} beginOAuth={vi.fn()} selected="cliniko" />);
    expect(screen.getByLabelText(/API key/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /connect with halaxy/i })).toBeNull();
  });
  it("shows an OAuth button when an oauth2 PMS is selected", () => {
    render(<ConnectForm options={catalog} connectApiKey={vi.fn()} beginOAuth={vi.fn()} selected="halaxy" />);
    expect(screen.queryByLabelText(/API key/i)).toBeNull();
    expect(screen.getByRole("button", { name: /connect/i })).toBeTruthy();
  });
});
