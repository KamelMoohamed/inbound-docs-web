import { api } from "@/lib/api";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const patients = await api.searchPatients(q);
  return Response.json(patients);
}
