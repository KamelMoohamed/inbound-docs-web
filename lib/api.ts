import "server-only";
import { ReviewItem, ReviewDetail, Patient, Metrics } from "./types";

const BASE = process.env.BACKEND_URL!;
const KEY = process.env.BACKEND_API_KEY!;
const headers = { "X-API-Key": KEY };

async function get(path: string) {
  const r = await fetch(`${BASE}${path}`, { headers, cache: "no-store" });
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}

export const api = {
  listReview: async () => ReviewItem.array().parse(await get("/review")),
  getReview: async (id: string) => ReviewDetail.parse(await get(`/review/${id}`)),
  searchPatients: async (q: string) => Patient.array().parse(await get(`/patients?q=${encodeURIComponent(q)}`)),
  metrics: async () => Metrics.parse(await get("/metrics")),

  async confirm(id: string, body: { patient_id?: string | null; doc_type?: string | null; accepted_unchanged: boolean }) {
    const r = await fetch(`${BASE}/review/${id}/confirm`, {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(`confirm → ${r.status}`);
    return r.json();
  },
  async upload(form: FormData) {
    const r = await fetch(`${BASE}/ingest/upload`, { method: "POST", headers, body: form });
    if (!r.ok) throw new Error(`upload → ${r.status}`);
    return r.json();
  },
  async importRoster(form: FormData) {
    const r = await fetch(`${BASE}/roster/import`, { method: "POST", headers, body: form });
    if (!r.ok) throw new Error(`roster → ${r.status}`);
    return r.json();
  },
  async raw(id: string) {
    return fetch(`${BASE}/review/${id}/raw`, { headers, cache: "no-store" });
  },
};
