import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const access = req.cookies.get("auth_access")?.value;
  if (!access) return new Response("unauthorized", { status: 401 });
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const upstream = await fetch(`${process.env.BACKEND_URL}/patients?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${access}` }, cache: "no-store" });
  if (!upstream.ok) return new Response("error", { status: upstream.status });
  return Response.json(await upstream.json());
}
