import "server-only";
import { ReviewItem, ReviewDetail, Patient, Metrics, OrgUser, FailedDoc,
         BillingSummary, CreditTxn, Channel, HeldDoc } from "./types";
import { getSession } from "./auth";

const BASE = process.env.BACKEND_URL!;

async function authHeaders() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${session.access}`, "Content-Type": "application/json" };
}

async function get(path: string) {
  const r = await fetch(`${BASE}${path}`, { headers: await authHeaders(), cache: "no-store" });
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}

async function post(path: string, body?: unknown, isFormData = false) {
  const headers = await authHeaders();
  if (isFormData) delete (headers as Record<string, string>)["Content-Type"];
  const r = await fetch(`${BASE}${path}`, {
    method: "POST", headers,
    body: isFormData ? (body as FormData) : JSON.stringify(body ?? {}),
  });
  if (!r.ok) throw new Error(`POST ${path} → ${r.status}`);
  return r.json();
}

export const api = {
  listReview:     async () => ReviewItem.array().parse(await get("/review")),
  getReview:      async (id: string) => ReviewDetail.parse(await get(`/review/${id}`)),
  listFailed:     async () => FailedDoc.array().parse(await get("/review/failed")),
  searchPatients: async (q: string) => Patient.array().parse(await get(`/patients?q=${encodeURIComponent(q)}`)),
  metrics:        async () => Metrics.parse(await get("/metrics")),
  listOrgUsers:   async () => OrgUser.array().parse(await get("/org/users")),
  confirm:   (id: string, body: { patient_id?: string | null; doc_type?: string | null; accepted_unchanged: boolean }) =>
               post(`/review/${id}/confirm`, body),
  retry:     (id: string) => post(`/review/${id}/retry`),
  upload:    (form: FormData) => post("/ingest/upload", form, true),
  importRoster: (form: FormData) => post("/roster/import", form, true),
  rematch:   () => post("/roster/rematch"),
  invite:    (email: string, role: string) => post("/org/invitations", { email, role }),
  setRole:   async (userId: string, role: string) => fetch(`${BASE}/org/users/${userId}/role`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify({ role }) }).then(r => r.json()),
  removeUser: async (userId: string) => fetch(`${BASE}/org/users/${userId}`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  rotateKey: () => post("/org/ingestion-key/rotate"),
  billingSummary: async () => BillingSummary.parse(await get("/billing/summary")),
  creditTxns:     async () => CreditTxn.array().parse(await get("/billing/transactions")),
  checkout:       (plan: string) => post("/billing/checkout", { plan }) as Promise<{ url: string }>,
  portal:         () => post("/billing/portal") as Promise<{ url: string }>,
  listChannels:   async () => Channel.array().parse(await get("/org/channels")),
  createChannel:  (body: { type: string; address: string; label?: string; webhookSecret?: string }) =>
                    post("/org/channels", body),
  updateChannel:  async (id: string, body: { label?: string; active?: boolean }) =>
                    fetch(`${BASE}/org/channels/${id}`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  deleteChannel:  async (id: string) =>
                    fetch(`${BASE}/org/channels/${id}`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  listHeld:       async () => HeldDoc.array().parse(await get("/review/held")),
  changePassword: (currentPassword: string, newPassword: string) =>
                    post("/auth/change-password", { currentPassword, newPassword }),
  raw: async (id: string) => {
    const h = await authHeaders();
    return fetch(`${BASE}/review/${id}/raw`, { headers: h, cache: "no-store" });
  },
};

// Public (no auth) — used in server actions for login/signup
export const publicApi = {
  async signup(orgName: string, email: string, name: string, password: string) {
    const r = await fetch(`${BASE}/auth/signup`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orgName, email, name, password }) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async login(email: string, password: string) {
    const r = await fetch(`${BASE}/auth/login`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!r.ok) throw new Error("invalid credentials");
    return r.json();
  },
  async logout(refresh: string) {
    await fetch(`${BASE}/auth/logout`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh }) });
  },
  async forgotPassword(email: string) {
    await fetch(`${BASE}/auth/forgot-password`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
  },
  async resetPassword(token: string, password: string) {
    const r = await fetch(`${BASE}/auth/reset-password`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    if (!r.ok) throw new Error(await r.text());
  },
  async getInvite(token: string) {
    const r = await fetch(`${BASE}/invitations?token=${encodeURIComponent(token)}`);
    if (!r.ok) throw new Error("invalid or expired invite");
    return r.json() as Promise<{ email: string; role: string }>;
  },
  async acceptInvite(token: string, name: string, password: string) {
    const r = await fetch(`${BASE}/invitations/accept`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, name, password }) });
    if (!r.ok) throw new Error(await r.text());
  },
};
