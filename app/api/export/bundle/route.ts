import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const access = req.cookies.get("auth_access")?.value;
  if (!access) return new Response("unauthorized", { status: 401 });
  const upstream = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/export/bundle`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });
  if (!upstream.ok) return new Response("bundle unavailable", { status: upstream.status });
  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": upstream.headers.get("content-disposition") ?? 'attachment; filename="clinidoc-export.zip"',
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
