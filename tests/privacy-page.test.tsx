import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage from "@/app/(marketing)/privacy/page";

describe("Privacy policy", () => {
  it("includes the required compliance sections", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /use of artificial intelligence/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /overseas disclosure/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /notifiable data breaches/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /access and correction/i })).toBeTruthy();
  });
});
