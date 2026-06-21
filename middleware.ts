import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login", "/signup", "/forgot-password", "/reset-password", "/invitations"];

function isExpired(token: string): boolean {
  try {
    const p = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return p.exp * 1000 < Date.now() + 30_000;
  } catch { return true; }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.next(); // route handlers auth themselves

  const access = req.cookies.get("auth_access")?.value;
  const refresh = req.cookies.get("auth_refresh")?.value;

  if (access && !isExpired(access)) return NextResponse.next();

  if (refresh) {
    try {
      const res = await fetch(`${process.env.BACKEND_URL}/auth/refresh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (res.ok) {
        const data = await res.json();
        const next = NextResponse.next();
        const opts = { httpOnly: true, sameSite: "lax" as const, path: "/" };
        next.cookies.set("auth_access", data.access, opts);
        next.cookies.set("auth_refresh", data.refresh, opts);
        return next;
      }
    } catch {}
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
