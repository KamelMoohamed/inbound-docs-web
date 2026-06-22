import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiUseNotice } from "@/components/AiUseNotice";

describe("AiUseNotice", () => {
  it("states AI is used and a human confirms", () => {
    render(<AiUseNotice />);
    expect(screen.getByText(/AI/)).toBeTruthy();
    expect(screen.getByText(/reviewed|confirm/i)).toBeTruthy();
  });
});
