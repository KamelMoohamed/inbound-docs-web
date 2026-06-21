import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverdueBanner } from "../components/OverdueBanner";

describe("OverdueBanner", () => {
  it("renders when urgent_pending > 0", () => {
    render(<OverdueBanner metrics={{ needs_review: 5, urgent_pending: 2, filed_total: 10, auto_handled_pct: 80 }} />);
    expect(screen.getByText(/overdue urgent/i)).toBeTruthy();
  });
  it("renders nothing when no overdue", () => {
    const { container } = render(<OverdueBanner metrics={{ needs_review: 0, urgent_pending: 0, filed_total: 0, auto_handled_pct: 0 }} />);
    expect(container.firstChild).toBeNull();
  });
});
