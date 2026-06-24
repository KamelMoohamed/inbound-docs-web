"use server";

import { FIELD_LIMITS, anyTooLong } from "@/lib/formLimits";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function submitContact(_prev: unknown, formData: FormData) {
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    practice: String(formData.get("practice") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  if (!payload.email || !payload.name) return { ok: false, error: "Name and email are required." };
  // Defence in depth: reject oversized fields even if the client maxLength is bypassed.
  if (
    anyTooLong(
      [payload.name, FIELD_LIMITS.name],
      [payload.email, FIELD_LIMITS.email],
      [payload.practice, FIELD_LIMITS.practice],
      [payload.message, FIELD_LIMITS.message],
    )
  ) {
    return { ok: false, error: "One or more fields are too long." };
  }
  try {
    const r = await fetch(`${BASE}/leads/contact`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (!r.ok) return { ok: false, error: "Something went wrong — email us at support@clinidoc.com.au." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong — email us at support@clinidoc.com.au." };
  }
}
