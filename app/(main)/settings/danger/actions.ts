"use server";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { clearAuthCookies } from "@/lib/auth";

export async function deleteOrgAction(confirm: string) {
  await api.deleteOrg(confirm);
  await clearAuthCookies();
  redirect("/goodbye");
}
