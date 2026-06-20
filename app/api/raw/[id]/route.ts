import { api } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const upstream = await api.raw(params.id);
  if (!upstream.ok) return new Response("not found", { status: upstream.status });
  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
               "Cache-Control": "no-store" },
  });
}
