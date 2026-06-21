import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = { userId: string; tenantId: string; role: string; email: string; access: string };

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const access = store.get("auth_access")?.value;
  if (!access) return null;
  try {
    const payload = JSON.parse(atob(access.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { userId: payload.sub, tenantId: payload.tid, role: payload.role, email: payload.email, access };
  } catch { return null; }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function setAuthCookies(access: string, refresh: string) {
  const store = await cookies();
  const opts = { httpOnly: true, sameSite: "lax" as const, path: "/" };
  store.set("auth_access", access, opts);
  store.set("auth_refresh", refresh, opts);
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete("auth_access");
  store.delete("auth_refresh");
}
