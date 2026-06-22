"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function dismissOnboardingAction() {
  await api.dismissOnboarding();
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
}
