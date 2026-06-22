"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { setAuthCookies } from "@/lib/auth";
import { cookies } from "next/headers";

export async function adjustCreditsAction(tenantId: string, formData: FormData) {
  const amount = Number(formData.get("amount"));
  const reason = formData.get("reason") as string;
  await api.adminAdjustCredits(tenantId, amount, reason);
  revalidatePath(`/admin/tenants/${tenantId}`);
}

export async function impersonateAction(tenantId: string) {
  const tokens = await api.adminImpersonate(tenantId);
  await setAuthCookies(tokens.access, tokens.refresh);
  const store = await cookies();
  store.set("impersonating", "1", { httpOnly: false, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" });
  redirect("/dashboard");
}
