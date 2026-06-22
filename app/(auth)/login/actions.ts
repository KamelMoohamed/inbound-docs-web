"use server";
import { redirect } from "next/navigation";
import { publicApi } from "@/lib/api";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth";
import { routeAfterLogin } from "@/lib/loginRoute";
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
    const route = routeAfterLogin({
      access: data.access,
      refresh: data.refresh,
      mfa_required: data.mfa_required,
      mfa_token: data.mfa_token ?? data.mfaToken,
      mfa_enrollment_required: data.mfa_enrollment_required,
      enrol_token: data.enrol_token,
    });
    if (route.kind === "enrol") {
      redirect(`/mfa-enroll?token=${encodeURIComponent(route.token)}`);
    }
    if (route.kind === "challenge") {
      return { mfa_required: true, mfaToken: route.token };
    }
    if (!data.access || !data.refresh) throw new Error("missing tokens");
    await setAuthCookies(data.access, data.refresh);
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    return { error: "Invalid email or password." };
  }
  redirect("/inbox");
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
  redirect("/inbox");
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
