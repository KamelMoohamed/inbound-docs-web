import { describe, it, expect } from "vitest";
import { Provider, Notification, NotificationFeed } from "../lib/types";

describe("P1 types", () => {
  it("parses a provider", () => {
    const p = Provider.parse({ id: "1", name: "Dr Smith", active: true });
    expect(p.name).toBe("Dr Smith");
  });

  it("parses a notification", () => {
    const n = Notification.parse({
      id: "n1", type: "urgent", title: "Urgent doc", body: "Review now",
      document_id: "d1", read_at: null, created_at: "2026-06-21T00:00:00Z",
    });
    expect(n.title).toBe("Urgent doc");
  });

  it("parses a notification feed", () => {
    const feed = NotificationFeed.parse({
      items: [{ id: "n1", type: "urgent", title: "T", body: "B", document_id: null, read_at: null, created_at: "2026-06-21T00:00:00Z" }],
      unread: 1,
    });
    expect(feed.unread).toBe(1);
  });
});
