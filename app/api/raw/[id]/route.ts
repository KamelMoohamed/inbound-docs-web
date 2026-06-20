import { api } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const upstream = await api.raw(id);
  if (!upstream.ok) return new Response("not found", { status: upstream.status });
  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
               "Cache-Control": "no-store" },
  });
}
