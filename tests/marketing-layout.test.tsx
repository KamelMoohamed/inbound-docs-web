import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

describe("MarketingFooter", () => {
  it("links to legal pages", () => {
    render(<MarketingFooter />);
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Sub-processors")).toBeInTheDocument();
  });
});
