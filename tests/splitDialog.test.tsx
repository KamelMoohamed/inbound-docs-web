import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SplitDialog, parseRanges } from "../components/SplitDialog";

describe("SplitDialog", () => {
  it("parses ranges and calls split on submit", () => {
    expect(parseRanges("1-2, 3")).toEqual(["1-2", "3"]);
    const split = vi.fn();
    render(<SplitDialog split={split} />);
    fireEvent.change(screen.getByLabelText(/page ranges/i), { target: { value: "1-2, 3" } });
    fireEvent.submit(screen.getByRole("button", { name: /split document/i }).closest("form")!);
    expect(split).toHaveBeenCalled();
    const fd = split.mock.calls[0][0] as FormData;
    expect(fd.get("ranges")).toBe("1-2, 3");
  });
});
