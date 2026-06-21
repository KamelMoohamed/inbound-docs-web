import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import type { NotificationFeed } from "@/lib/types";
import { logoutAction } from "@/app/(auth)/login/actions";
import { NavLinks } from "./NavLinks";
import { Badge } from "./Badge";
import { CreditPill } from "@/components/CreditPill";
import { NotificationBell } from "./NotificationBell";
import { markNotifReadAction, markAllReadAction } from "@/app/(main)/notifications/actions";

export async function Nav() {
  const session = await getSession();
  let feed: NotificationFeed = { items: [], unread: 0 };
  if (session) {
    try { feed = await api.notifications(); } catch { /* backend may be unavailable */ }
  }
  return (
    <nav className="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <span className="mr-4 font-semibold text-indigo-600">Inbound Docs</span>
      <NavLinks />
      {session && (
        <div className="ml-auto flex items-center gap-3">
          <NotificationBell
            feed={feed}
            onRead={markNotifReadAction}
            onReadAll={markAllReadAction}
          />
          <span className="text-xs text-slate-500">{session.email}</span>
          <Badge tone="muted">{session.role}</Badge>
          <CreditPill />
          <span className="text-slate-300">|</span>
          <form action={logoutAction}>
            <button className="text-sm text-red-600 hover:underline">
              Logout
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
