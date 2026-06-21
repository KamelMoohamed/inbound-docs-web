import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssignControl } from "../components/AssignControl";

const providers = [
  { id: "p1", name: "Dr Smith", user_id: "u1", active: true },
  { id: "p2", name: "Dr Jones", user_id: null, active: true },
];

describe("AssignControl", () => {
  it("calls assign with provider_id and user_id on submit", () => {
    const assign = vi.fn();
    render(<AssignControl providers={providers} assign={assign} />);
    fireEvent.change(screen.getByLabelText(/provider/i), { target: { value: "p1" } });
    fireEvent.submit(screen.getByRole("button", { name: /assign/i }).closest("form")!);
    expect(assign).toHaveBeenCalled();
    const fd = assign.mock.calls[0][0] as FormData;
    expect(fd.get("provider_id")).toBe("p1");
    expect(fd.get("user_id")).toBe("u1");
  });
});
