import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Badge } from "@/components/Badge";

test("renders label and tone class", () => {
  render(<Badge tone="danger">Urgent</Badge>);
  const el = screen.getByText("Urgent");
  expect(el).toBeTruthy();
  expect(el.className).toContain("bg-red");
});
