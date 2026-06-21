import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = req.cookies.get("auth_access")?.value;
  if (!access) return new Response("unauthorized", { status: 401 });
  const upstream = await fetch(`${process.env.BACKEND_URL}/review/${id}/raw`, {
    headers: { Authorization: `Bearer ${access}` }, cache: "no-store" });
  if (!upstream.ok) return new Response("not found", { status: upstream.status });
  const buf = await upstream.arrayBuffer();
  return new Response(buf, { status: 200,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
               "Cache-Control": "no-store" } });
}
