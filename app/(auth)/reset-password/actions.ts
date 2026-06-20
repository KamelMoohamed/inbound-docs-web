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
  } catch {
    return { error: "Reset link is invalid or expired. Please request a new one." };
  }
  redirect("/login");
}
