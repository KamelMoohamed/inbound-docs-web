"use client";
import { useState } from "react";
import type { NotificationFeed } from "@/lib/types";

export function NotificationBell({
  feed,
  onRead,
  onReadAll,
}: {
  feed: NotificationFeed;
  onRead: (id: string) => void | Promise<void>;
  onReadAll: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50"
        aria-label="Notifications"
      >
        🔔
        {feed.unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {feed.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="text-xs font-semibold text-slate-700">Notifications</span>
            {feed.unread > 0 && (
              <button type="button" onClick={() => onReadAll()} className="text-xs text-indigo-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {feed.items.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-slate-400">No notifications</li>
            )}
            {feed.items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onRead(n.id)}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-50 ${!n.read_at ? "font-semibold" : "text-slate-500"}`}
                >
                  <p className="text-sm">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.body}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
