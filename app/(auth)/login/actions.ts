"use server";
import { redirect } from "next/navigation";
import { publicApi } from "@/lib/api";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth";
import { cookies } from "next/headers";

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const data = await publicApi.login(email, password);
    await setAuthCookies(data.access, data.refresh);
  } catch {
    return { error: "Invalid email or password." };
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
