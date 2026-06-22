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
  } catch {
    return { error: "Could not create account. Please try again." };
  }
  redirect("/inbox");
}
