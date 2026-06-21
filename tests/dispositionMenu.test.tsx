import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DispositionMenu } from "../components/DispositionMenu";

describe("DispositionMenu", () => {
  it("shows discard and mark duplicate; discard calls action", () => {
    const discard = vi.fn();
    render(<DispositionMenu discard={discard} markDuplicate={vi.fn()} />);
    expect(screen.getByRole("button", { name: /discard/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /mark duplicate/i })).toBeTruthy();
    fireEvent.submit(screen.getByRole("button", { name: /discard/i }).closest("form")!);
    expect(discard).toHaveBeenCalled();
  });
});
