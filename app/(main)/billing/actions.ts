"use server";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { isNextControlFlow } from "@/lib/formAction";

export type BillingActionState = { error?: string } | null;

export async function checkoutAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const plan = String(formData.get("plan") ?? "").trim();
  if (!plan) return { error: "No plan selected." };
  try {
    const { url } = await api.checkout(plan);
    redirect(url);
  } catch (e) {
    if (isNextControlFlow(e)) throw e;
    return { error: e instanceof Error ? e.message : "Could not start checkout." };
  }
}

export async function portalAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  void formData;
  try {
    const { url } = await api.portal();
    redirect(url);
  } catch (e) {
    if (isNextControlFlow(e)) throw e;
    return { error: e instanceof Error ? e.message : "Could not open the billing portal." };
  }
}
