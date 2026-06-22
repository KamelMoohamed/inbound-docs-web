import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/(marketing)/page";

describe("LandingPage", () => {
  it("shows the hero headline and a Start free link", () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { name: /incoming clinical documents/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /start free/i }).length).toBeGreaterThan(0);
  });
});
