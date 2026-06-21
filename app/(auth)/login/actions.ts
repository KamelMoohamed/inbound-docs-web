"use server";
import { redirect } from "next/navigation";
import { publicApi } from "@/lib/api";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth";
import { cookies } from "next/headers";

export type LoginState = { error?: string; mfa_required?: boolean; mfaToken?: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const data = await publicApi.login(email, password);
    if (data.mfa_required && data.mfaToken) {
      return { mfa_required: true, mfaToken: data.mfaToken };
    }
    if (!data.access || !data.refresh) throw new Error("missing tokens");
    await setAuthCookies(data.access, data.refresh);
  } catch {
    return { error: "Invalid email or password." };
  }
  redirect("/");
}

export async function mfaLoginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    const data = await publicApi.mfaLogin(
      String(formData.get("mfaToken") ?? ""),
      String(formData.get("code") ?? ""),
    );
    await setAuthCookies(data.access, data.refresh);
  } catch {
    return { error: "Invalid authentication code." };
  }
  redirect("/");
}

export async function logoutAction() {
  const store = await cookies();
  const refresh = store.get("auth_refresh")?.value ?? "";
  try {
    await publicApi.logout(refresh);
  } catch {
    // best-effort
  }
  await clearAuthCookies();
  redirect("/login");
}
