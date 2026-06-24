import "server-only";
import { ReviewItem, ReviewDetail, Patient, Metrics, OrgUser, FailedDoc,
         BillingSummary, CreditTxn, Channel, HeldDoc, AuditEvent,
         PmsConnectionStatus, StuckDoc, PmsCatalogEntry,
         NotificationFeed, Provider, EscalationPolicy, ReportSummary, OrgAuditEntry,
         MeProfile, OnboardingStatus, SsoConfig, AdminTenant, WebhookEndpoint } from "./types";
import { getSession } from "./auth";
import { messageFromApiBody } from "./apiError";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

async function failResponse(r: Response, method: string, path: string): Promise<never> {
  const body = await r.text();
  throw new Error(messageFromApiBody(r.status, body, method, path));
}

async function authHeaders() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${session.access}`, "Content-Type": "application/json" };
}

async function get(path: string) {
  const r = await fetch(`${BASE}${path}`, { headers: await authHeaders(), cache: "no-store" });
  if (!r.ok) await failResponse(r, "GET", path);
  return r.json();
}

async function post(path: string, body?: unknown, isFormData = false) {
  const headers = await authHeaders();
  if (isFormData) delete (headers as Record<string, string>)["Content-Type"];
  const r = await fetch(`${BASE}${path}`, {
    method: "POST", headers,
    body: isFormData ? (body as FormData) : JSON.stringify(body ?? {}),
  });
  if (!r.ok) await failResponse(r, "POST", path);
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
  createChannel:  (body: { type: string; label?: string }) => post("/org/channels", body),
  regenerateChannelSecret: (id: string) => post(`/org/channels/${id}/regenerate-secret`),
  createPatient:  (b: { first_name: string; last_name: string; dob?: string | null; medicare_number?: string | null }) => post("/patients", b),
  updatePatient:  async (id: string, b: Record<string, unknown>) =>
                    fetch(`${BASE}/patients/${id}`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify(b) }).then(r => r.json()),
  deletePatient:  async (id: string) =>
                    fetch(`${BASE}/patients/${id}`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  updateDoc:      async (id: string, b: { doc_type?: string | null; patient_id?: string | null }) =>
                    fetch(`${BASE}/review/${id}`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify(b) }).then(r => r.json()),
  getAudit:       async (id: string) => AuditEvent.array().parse(await get(`/review/${id}/audit`)),
  updateProfile:  async (name: string) =>
                    fetch(`${BASE}/auth/me`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify({ name }) }).then(r => r.json()),
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
  pmsConnection:  async () => PmsConnectionStatus.parse(await get("/pms/connection")),
  pmsConnectApiKey: (pms_type: string, api_key: string) => post("/pms/connection", { pms_type, api_key }),
  pmsAuthorizeUrl: async (pms_type: string) =>
                    get(`/pms/connection/authorize?pms_type=${encodeURIComponent(pms_type)}`) as Promise<{ url: string; state: string }>,
  pmsDisconnect:  async () => fetch(`${BASE}/pms/connection`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  pmsSync:        () => post("/pms/connection/sync") as Promise<{ synced: number }>,
  pmsStuck:       async () => StuckDoc.array().parse(await get("/pms/writeback/stuck")),
  notifications:  async () => NotificationFeed.parse(await get("/notifications")),
  markNotifRead:  (id: string) => post(`/notifications/${id}/read`),
  markAllRead:    () => post("/notifications/read-all"),
  listProviders:  async () => Provider.array().parse(await get("/providers")),
  createProvider: (b: { name: string; user_id?: string }) => post("/providers", b),
  updateProvider: async (id: string, b: Record<string, unknown>) =>
                    fetch(`${BASE}/providers/${id}`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify(b) }).then(r => r.json()),
  deleteProvider: async (id: string) => fetch(`${BASE}/providers/${id}`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  assignDoc:      (id: string, b: { provider_id?: string | null; user_id?: string | null }) => post(`/review/${id}/assign`, b),
  myQueue:        async () => ReviewItem.array().parse(await get("/review?assigned_to=me")),
  escalationPolicy: async () => EscalationPolicy.parse(await get("/escalation-policy")),
  setEscalationPolicy: async (body: Record<string, unknown>) =>
                    fetch(`${BASE}/escalation-policy`, { method: "PUT", headers: await authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  discardDoc:     (id: string, reason: string) => post(`/review/${id}/discard`, { reason }),
  markDuplicate:  (id: string, of_id: string) => post(`/review/${id}/duplicate`, { of_id }),
  splitDoc:       (id: string, ranges: string[]) => post(`/review/${id}/split`, { ranges }),
  reportSummary:  async (from: string, to: string) =>
                    ReportSummary.parse(await get(`/reports/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)),
  mfaSetup:       () => post("/auth/mfa/setup") as Promise<{ otpauthUrl: string; secret: string }>,
  mfaVerify:      (code: string) => post("/auth/mfa/verify", { code }),
  mfaDisable:     (code: string) => post("/auth/mfa/disable", { code }),
  orgAudit:       async (filters: { from?: string; to?: string; type?: string; actor?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (filters.from) q.set("from", filters.from);
    if (filters.to) q.set("to", filters.to);
    if (filters.type) q.set("type", filters.type);
    if (filters.actor) q.set("actor", filters.actor);
    if (filters.page) q.set("page", String(filters.page));
    const body = await get(`/org/audit?${q.toString()}`);
    return { items: OrgAuditEntry.array().parse(body.items ?? body), total: body.total ?? (body.items ?? body).length };
  },
  me:             async () => MeProfile.parse(await get("/auth/me")),
  resendVerification: () => post("/auth/resend-verification"),
  onboarding:     async () => OnboardingStatus.parse(await get("/onboarding")),
  dismissOnboarding: () => post("/onboarding/dismiss"),
  getSso:           async () => SsoConfig.parse(await get("/org/sso")),
  setSso:           async (body: Record<string, unknown>) =>
                    fetch(`${BASE}/org/sso`, { method: "PUT", headers: await authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  exportData:       async () => {
    const h = await authHeaders();
    const r = await fetch(`${BASE}/org/export`, { headers: h, cache: "no-store" });
    if (!r.ok) throw new Error(`GET /org/export → ${r.status}`);
    return r.blob();
  },
  deleteOrg:        async (confirm: string) => {
    const r = await fetch(`${BASE}/org`, { method: "DELETE", headers: await authHeaders(), body: JSON.stringify({ confirm }) });
    if (!r.ok) throw new Error(`DELETE /org → ${r.status}`);
    return r.json();
  },
  adminTenants:     async () => AdminTenant.array().parse(await get("/admin/tenants")),
  adminTenant:      async (id: string) => AdminTenant.parse(await get(`/admin/tenants/${id}`)),
  adminAdjustCredits: (id: string, amount: number, reason: string) =>
                    post(`/admin/tenants/${id}/credits`, { amount, reason }),
  adminImpersonate: async (id: string) =>
                    post(`/admin/tenants/${id}/impersonate`) as Promise<{ access: string; refresh: string }>,
  listWebhooks:     async () => WebhookEndpoint.array().parse(await get("/webhooks")),
  createWebhook:    (body: { url: string; events: string[] }) => post("/webhooks", body) as Promise<{ endpoint: WebhookEndpoint; secret: string }>,
  deleteWebhook:    async (id: string) => fetch(`${BASE}/webhooks/${id}`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  testWebhook:      (id: string) => post(`/webhooks/${id}/test`),
  updateWebhook:    async (id: string, body: { active?: boolean }) =>
                    fetch(`${BASE}/webhooks/${id}`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
};

// Public (no auth) — used in server actions for login/signup
export const publicApi = {
  async signup(orgName: string, email: string, name: string, password: string, tos_accepted: boolean, privacy_accepted: boolean, dpa_accepted: boolean) {
    const r = await fetch(`${BASE}/auth/signup`, { method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgName, email, name, password, tos_accepted, privacy_accepted, dpa_accepted }) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async verifyEmail(token: string) {
    const r = await fetch(`${BASE}/auth/verify-email`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async login(email: string, password: string) {
    const r = await fetch(`${BASE}/auth/login`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!r.ok) throw new Error("invalid credentials");
    return r.json() as Promise<{
      access?: string; refresh?: string;
      mfa_required?: boolean; mfa_token?: string; mfaToken?: string;
      mfa_enrollment_required?: boolean; enrol_token?: string;
    }>;
  },
  async mfaLogin(mfaToken: string, code: string) {
    const r = await fetch(`${BASE}/auth/mfa/login`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mfa_token: mfaToken, code }) });
    if (!r.ok) throw new Error("invalid code");
    return r.json() as Promise<{ access: string; refresh: string }>;
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
  async pmsCatalog() {
    const r = await fetch(`${BASE}/pms/catalog`, { cache: "no-store" });
    if (!r.ok) throw new Error("catalog unavailable");
    return PmsCatalogEntry.array().parse(await r.json());
  },
  async submitPmsRequest(input: { pms_name: string; clinic_name?: string; clinic_size?: string; segment?: string; contact_email: string; note?: string }) {
    const r = await fetch(`${BASE}/pms/requests`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<{ id: string; status: string }>;
  },
};
