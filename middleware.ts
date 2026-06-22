import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookieOptions } from "./lib/cookieOptions";

const PUBLIC = [
  "/", "/pricing", "/security", "/about", "/contact", "/integrations",
  "/privacy", "/terms", "/sub-processors",
  "/login", "/signup", "/forgot-password", "/reset-password", "/invitations",
  "/verify-email", "/goodbye", "/mfa-enroll",
];

function isExpired(token: string): boolean {
  try {
    const p = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return p.exp * 1000 < Date.now() + 30_000;
  } catch { return true; }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const access = req.cookies.get("auth_access")?.value;

  // Logged-in users hitting the marketing landing go straight to the app.
  if (pathname === "/" && access && !isExpired(access)) {
    return NextResponse.redirect(new URL("/inbox", req.url));
  }
  if (PUBLIC.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)))) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/sso/")) return NextResponse.next();

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
        const opts = cookieOptions();
        next.cookies.set("auth_access", data.access, opts);
        next.cookies.set("auth_refresh", data.refresh, opts);
        return next;
      }
    } catch {}
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
