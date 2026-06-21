import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoopClosure } from "../components/LoopClosure";

describe("LoopClosure", () => {
  it("renders filed/task/ack status", () => {
    render(<LoopClosure pms_filing_id="x" pms_task_id="y" pms_acknowledged_at={null} />);
    expect(screen.getByText(/Filed ✓ · Task ✓ · Acknowledged —/)).toBeTruthy();
  });
});
