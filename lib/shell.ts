import "server-only";
import { cache } from "react";
import { getSession } from "./auth";
import { api } from "./api";
import type { BillingSummary, MeProfile, NotificationFeed } from "./types";

const EMPTY_FEED: NotificationFeed = { items: [], unread: 0 };

export type ShellData = {
  me: MeProfile | null;
  billing: BillingSummary | null;
  notifications: NotificationFeed;
};

/** One parallel fetch for all app-chrome data; deduped per request via React cache(). */
export const getShellData = cache(async (): Promise<ShellData | null> => {
  const session = await getSession();
  if (!session) return null;

  const [me, billing, notifications] = await Promise.all([
    api.me().catch(() => null),
    api.billingSummary().catch(() => null),
    api.notifications().catch(() => EMPTY_FEED),
  ]);

  return { me, billing, notifications };
});
