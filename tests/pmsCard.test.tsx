import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PmsCard } from "../components/PmsCard";

const entry = { key: "cliniko", display_name: "Cliniko", segment: "allied", hosting: "cloud",
  tier: "write_back" as const, capabilities: ["roster.read", "document.write"], status: "beta" as const };

describe("PmsCard", () => {
  it("shows the name, tier label, status, and capabilities", () => {
    render(<PmsCard entry={entry} />);
    expect(screen.getByText("Cliniko")).toBeTruthy();
    expect(screen.getByText("Auto-file into PMS")).toBeTruthy();
    expect(screen.getByText(/beta/i)).toBeTruthy();
    expect(screen.getByText("Files documents")).toBeTruthy();
    expect(screen.getByText("Syncs patient roster")).toBeTruthy();
  });
});
