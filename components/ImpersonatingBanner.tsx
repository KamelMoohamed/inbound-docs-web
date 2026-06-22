import { cookies } from "next/headers";

export async function ImpersonatingBanner() {
  const store = await cookies();
  if (!store.get("impersonating")?.value) return null;
  return (
    <div className="border-b border-purple-300 bg-purple-100 px-6 py-2 text-center text-sm text-purple-900">
      You are impersonating a tenant.{" "}
      <a href="/admin/tenants" className="font-semibold underline">Return to admin</a>
    </div>
  );
}
