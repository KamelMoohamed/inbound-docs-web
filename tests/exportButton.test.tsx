import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ExportButton } from "@/components/ExportButton";

test("clicking export calls handler", async () => {
  const onExport = vi.fn().mockResolvedValue(undefined);
  render(<ExportButton onExport={onExport} />);
  fireEvent.click(screen.getByRole("button", { name: /export my data/i }));
  expect(onExport).toHaveBeenCalled();
});
