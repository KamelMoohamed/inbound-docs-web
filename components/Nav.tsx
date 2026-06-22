import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import type { NotificationFeed } from "@/lib/types";
import { logoutAction } from "@/app/(auth)/login/actions";
import { NavLinks } from "./NavLinks";
import { NavMenu, NavMenuItem } from "./NavMenu";
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
      <span className="mr-4 font-semibold text-indigo-600">CliniDoc</span>
      <NavLinks />
      {session && (
        <div className="ml-auto flex items-center gap-3">
          <NotificationBell
            feed={feed}
            onRead={markNotifReadAction}
            onReadAll={markAllReadAction}
          />
          <CreditPill />

          {/* Configuration / setup — not daily-use, grouped out of the way. */}
          <NavMenu
            label="Settings"
            align="right"
            muted
            activePrefixes={["/providers", "/channels", "/org", "/billing", "/settings"]}
          >
            <NavMenuItem href="/providers" label="Providers" />
            <NavMenuItem href="/channels" label="Channels" />
            <NavMenuItem href="/settings/integrations" label="Integrations" />
            <NavMenuItem href="/settings/webhooks" label="Webhooks" />
            <NavMenuItem href="/org" label="Team" />
            <NavMenuItem href="/billing" label="Billing" />
          </NavMenu>

          {/* Account menu: identity + security + logout. */}
          <NavMenu label={session.email} align="right" muted>
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="truncate text-xs text-slate-500">{session.email}</span>
              <Badge tone="muted">{session.role}</Badge>
            </div>
            <div className="my-1 border-t border-slate-100" />
            <NavMenuItem href="/settings" label="Account & security" />
            <div className="my-1 border-t border-slate-100" />
            <form action={logoutAction}>
              <button className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50">
                Logout
              </button>
            </form>
          </NavMenu>
        </div>
      )}
    </nav>
  );
}
