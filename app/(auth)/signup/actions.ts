"use server";
import { redirect } from "next/navigation";
import { publicApi } from "@/lib/api";
import { setAuthCookies } from "@/lib/auth";

export async function signupAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  try {
    const data = await publicApi.signup(
      formData.get("orgName") as string,
      formData.get("email") as string,
      formData.get("name") as string,
      formData.get("password") as string,
      formData.get("tos_accepted") === "true",
      formData.get("privacy_accepted") === "true",
      formData.get("dpa_accepted") === "true",
    );
    await setAuthCookies(data.access, data.refresh);
  } catch (e) {
    // publicApi.signup throws Error(responseBody); surface known backend errors clearly.
    const raw = e instanceof Error ? e.message : "";
    try {
      const body = JSON.parse(raw) as { statusCode?: number; message?: string; issues?: { message: string }[] };
      if (body.statusCode === 409 || /already exists/i.test(body.message ?? "")) {
        return { error: "An account with this email already exists. Try signing in instead." };
      }
      if (Array.isArray(body.issues) && body.issues.length > 0) {
        return { error: body.issues[0].message };
      }
    } catch {
      /* response body was not JSON — fall through to the generic message */
    }
    return { error: "Could not create account. Please try again." };
  }
  redirect("/inbox");
}
