import { getSession } from "@/lib/auth";
import { getShellData } from "@/lib/shell";
import { logoutAction } from "@/app/(auth)/login/actions";
import { NavMenu, NavMenuItem } from "./NavMenu";
import { Badge } from "./Badge";
import { CreditPill } from "@/components/CreditPill";
import { NotificationBell } from "./NotificationBell";
import { markNotifReadAction, markAllReadAction } from "@/app/(main)/notifications/actions";

export async function NavAccount() {
  const session = await getSession();
  if (!session) return null;

  const shell = await getShellData();

  return (
    <div className="ml-auto flex items-center gap-3">
      <NotificationBell
        feed={shell?.notifications ?? { items: [], unread: 0 }}
        onRead={markNotifReadAction}
        onReadAll={markAllReadAction}
      />
      {shell?.billing && <CreditPill balance={shell.billing.balance} />}

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
  );
}
