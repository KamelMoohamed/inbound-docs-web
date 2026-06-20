"use server";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function checkoutAction(formData: FormData) {
  const plan = String(formData.get("plan"));
  const { url } = await api.checkout(plan);
  redirect(url); // Stripe-hosted Checkout
}

export async function portalAction() {
  const { url } = await api.portal();
  redirect(url); // Stripe-hosted Customer Portal
}
