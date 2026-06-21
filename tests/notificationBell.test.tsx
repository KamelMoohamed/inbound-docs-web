import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationBell } from "../components/NotificationBell";

const feed = {
  unread: 1,
  items: [{
    id: "n1", type: "urgent", title: "Urgent doc", body: "Review now",
    document_id: "d1", read_at: null, created_at: "2026-06-21T00:00:00Z",
  }],
};

describe("NotificationBell", () => {
  it("renders unread badge and calls onRead when item clicked", () => {
    const onRead = vi.fn();
    render(<NotificationBell feed={feed} onRead={onRead} onReadAll={vi.fn()} />);
    expect(screen.getByText("1")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Notifications"));
    fireEvent.click(screen.getByText("Urgent doc"));
    expect(onRead).toHaveBeenCalledWith("n1");
  });
});
