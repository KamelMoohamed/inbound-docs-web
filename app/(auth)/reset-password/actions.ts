"use server";
import { redirect } from "next/navigation";
import { publicApi } from "@/lib/api";

export async function resetAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  try {
    await publicApi.resetPassword(
      formData.get("token") as string,
      formData.get("password") as string,
    );
  } catch (e) {
    // Distinguish a password-policy rejection from an invalid/expired token.
    const raw = e instanceof Error ? e.message : "";
    try {
      const body = JSON.parse(raw) as { issues?: { message: string }[] };
      if (Array.isArray(body.issues) && body.issues.length > 0) {
        return { error: body.issues[0].message };
      }
    } catch {
      /* not JSON — fall through */
    }
    return { error: "Reset link is invalid or expired. Please request a new one." };
  }
  redirect("/login");
}
