import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ReviewTable } from "@/components/ReviewTable";
import type { ReviewItem } from "@/lib/types";

const items: ReviewItem[] = [
  { id: "1", doc_type: "pathology", urgency: "urgent", review_band: "attention",
    matched_patient_id: null, match_confidence: 40, summary: "High K+" },
  { id: "2", doc_type: "referral", urgency: "routine", review_band: "auto_ready",
    matched_patient_id: "p1", match_confidence: 96, summary: "Cardio referral" },
];

test("renders rows with summaries and links", () => {
  render(<ReviewTable items={items} />);
  expect(screen.getByText("High K+")).toBeTruthy();
  expect(screen.getByText("Cardio referral")).toBeTruthy();
  const link = screen.getAllByRole("link", { name: /open/i })[0];
  expect(link.getAttribute("href")).toContain("/review/");
});

test("renders an empty state", () => {
  render(<ReviewTable items={[]} />);
  expect(screen.getByText(/nothing to review/i)).toBeTruthy();
});
