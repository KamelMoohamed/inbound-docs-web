import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EscalationForm } from "../app/(main)/settings/escalation/EscalationForm";

const policy = { urgent_sla_minutes: 60, routine_sla_minutes: 240, failed_retry_ceiling: 3, escalate_to_user_id: null };
const users = [{ id: "u1", name: "Owner", email: "o@test", role: "owner" }];

describe("EscalationForm", () => {
  it("pre-fills policy and calls save with updated value", () => {
    const save = vi.fn();
    render(<EscalationForm policy={policy} users={users} save={save} />);
    expect((screen.getByLabelText(/urgent sla/i) as HTMLInputElement).value).toBe("60");
    fireEvent.change(screen.getByLabelText(/urgent sla/i), { target: { value: "30" } });
    fireEvent.submit(screen.getByRole("button", { name: /save policy/i }).closest("form")!);
    expect(save).toHaveBeenCalled();
    const fd = save.mock.calls[0][0] as FormData;
    expect(fd.get("urgent_sla_minutes")).toBe("30");
  });
});
