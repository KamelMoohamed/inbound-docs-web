"use server";
import { redirect } from "next/navigation";
import { setAuthCookies } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function startEnroll(enrolToken: string) {
  const r = await fetch(`${BASE}/auth/mfa/enrol/setup`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enrol_token: enrolToken }),
  });
  if (!r.ok) throw new Error("enrol setup failed");
  return r.json() as Promise<{ secret: string; otpauthUrl: string }>;
}

export async function completeEnroll(enrolToken: string, code: string) {
  const r = await fetch(`${BASE}/auth/mfa/enrol/enable`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enrol_token: enrolToken, code }),
  });
  if (!r.ok) return { error: "Invalid code" };
  const data = await r.json();
  await setAuthCookies(data.access, data.refresh);
  redirect("/dashboard");
}
