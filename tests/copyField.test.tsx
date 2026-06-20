import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { CopyField } from "@/components/CopyField";

test("renders the label and value", () => {
  render(<CopyField label="Forwarding address" value="docs-abc@inbound.test" />);
  expect(screen.getByText("Forwarding address")).toBeTruthy();
  expect((screen.getByDisplayValue("docs-abc@inbound.test"))).toBeTruthy();
  expect(screen.getByRole("button", { name: /copy/i })).toBeTruthy();
});
