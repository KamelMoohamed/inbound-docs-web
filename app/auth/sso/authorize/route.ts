import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain");
  if (!domain) redirect("/login");
  redirect(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sso/authorize?domain=${encodeURIComponent(domain)}`);
}
