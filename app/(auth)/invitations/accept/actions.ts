"use server";
import { redirect } from "next/navigation";
import { publicApi } from "@/lib/api";

export async function acceptAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  try {
    await publicApi.acceptInvite(
      formData.get("token") as string,
      formData.get("name") as string,
      formData.get("password") as string,
    );
  } catch {
    return { error: "Could not accept invitation. The link may have expired." };
  }
  redirect("/login");
}
