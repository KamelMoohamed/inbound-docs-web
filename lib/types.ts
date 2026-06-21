import { z } from "zod";

export const MatchedPatient = z.object({
  id: z.string(), first_name: z.string(), last_name: z.string(), dob: z.string().nullable(),
});
export type MatchedPatient = z.infer<typeof MatchedPatient>;

export const AuditEvent = z.object({
  id: z.string(), event_type: z.string(), actor: z.string(),
  detail: z.any().nullable(), created_at: z.string(),
});
export type AuditEvent = z.infer<typeof AuditEvent>;

export const ChannelSetup = z.object({
  kind: z.string(), instructions: z.string(), fields: z.record(z.string(), z.string()),
});
export type ChannelSetup = z.infer<typeof ChannelSetup>;

export const ReviewItem = z.object({
  id: z.string(), doc_type: z.string().nullable(), urgency: z.string().nullable(),
  review_band: z.string().nullable(), matched_patient_id: z.string().nullable(),
  match_confidence: z.number().nullable(), summary: z.string().nullable(),
  matched_patient: MatchedPatient.nullable(),
});
export type ReviewItem = z.infer<typeof ReviewItem>;

export const ReviewDetail = z.object({
  id: z.string(), status: z.string(), doc_type: z.string().nullable(), urgency: z.string().nullable(),
  extracted: z.any().nullable(), matched_patient_id: z.string().nullable(),
  match_confidence: z.number().nullable(), raw_uri: z.string(),
  matched_patient: MatchedPatient.nullable(),
  pms_filing_id: z.string().nullable().optional(),
  pms_task_id: z.string().nullable().optional(),
  pms_acknowledged_at: z.string().nullable().optional(),
});
export type ReviewDetail = z.infer<typeof ReviewDetail>;

export const Patient = z.object({
  id: z.string(), first_name: z.string(), last_name: z.string(),
  dob: z.string().nullable(), medicare_number: z.string().nullable(),
});
export type Patient = z.infer<typeof Patient>;

export const Metrics = z.object({
  needs_review: z.number(), urgent_pending: z.number(),
  filed_total: z.number(), auto_handled_pct: z.number(),
});
export type Metrics = z.infer<typeof Metrics>;

export const AuthResponse = z.object({
  access: z.string(), refresh: z.string(),
  user: z.object({ id: z.string(), email: z.string(), name: z.string(), role: z.string(), tenantId: z.string() }),
});
export type AuthResponse = z.infer<typeof AuthResponse>;

export const OrgUser = z.object({ id: z.string(), email: z.string(), name: z.string(), role: z.string() });
export type OrgUser = z.infer<typeof OrgUser>;

export const FailedDoc = z.object({ id: z.string(), doc_type: z.string().nullable(), error: z.string().nullable(), created_at: z.string() });
export type FailedDoc = z.infer<typeof FailedDoc>;

export const PlanInfo = z.object({
  key: z.string(), status: z.string(), monthlyCredits: z.number(),
  rolloverCap: z.number(), currentPeriodEnd: z.string(),
});
export const BillingSummary = z.object({
  balance: z.number(),
  plan: PlanInfo.nullable(),
  held: z.number(),
  plans: z.record(z.string(), z.object({ monthlyCredits: z.number(), rolloverCap: z.number() })),
});
export type BillingSummary = z.infer<typeof BillingSummary>;

export const CreditTxn = z.object({
  id: z.string(), amount: z.number(), type: z.string(), reason: z.string(),
  documentId: z.string().nullable(), balanceAfter: z.number(), createdAt: z.string(),
});
export type CreditTxn = z.infer<typeof CreditTxn>;

export const Channel = z.object({
  id: z.string(), type: z.string(), address: z.string(),
  label: z.string().nullable(), active: z.boolean(),
  createdAt: z.string(), hasWebhookSecret: z.boolean(),
});
export type Channel = z.infer<typeof Channel>;

export const HeldDoc = z.object({
  id: z.string(), source: z.string(), doc_type: z.string().nullable(),
  credit_cost: z.number().nullable(), created_at: z.string(),
});
export type HeldDoc = z.infer<typeof HeldDoc>;

export const PmsCatalogEntry = z.object({
  key: z.string(),
  display_name: z.string(),
  segment: z.string(),
  hosting: z.string(),
  tier: z.enum(["write_back", "roster", "export_only"]),
  capabilities: z.array(z.string()),
  status: z.enum(["live", "beta", "planned"]),
});
export type PmsCatalogEntry = z.infer<typeof PmsCatalogEntry>;

export const PmsConnectionStatus = z.union([
  z.object({ connected: z.literal(false) }),
  z.object({
    connected: z.literal(true),
    pmsType: z.string(),
    authKind: z.enum(["api_key", "oauth2"]),
    status: z.string(),
    capabilities: z.array(z.string()),
    lastRosterSyncAt: z.string().nullable(),
    lastError: z.string().nullable(),
  }),
]);
export type PmsConnectionStatus = z.infer<typeof PmsConnectionStatus>;

export const StuckDoc = z.object({
  id: z.string(),
  doc_type: z.string().nullable(),
  write_back_status: z.string(),
  write_back_attempts: z.number(),
  write_back_error: z.string().nullable(),
  updated_at: z.string(),
  pms_filing_id: z.string().nullable().optional(),
  pms_task_id: z.string().nullable().optional(),
  pms_acknowledged_at: z.string().nullable().optional(),
});
export type StuckDoc = z.infer<typeof StuckDoc>;

export const Provider = z.object({
  id: z.string(), name: z.string(), external_id: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(), active: z.boolean(),
});
export type Provider = z.infer<typeof Provider>;

export const Notification = z.object({
  id: z.string(), type: z.string(), title: z.string(), body: z.string(),
  document_id: z.string().nullable(), read_at: z.string().nullable(), created_at: z.string(),
});
export const NotificationFeed = z.object({ items: z.array(Notification), unread: z.number() });
export type Notification = z.infer<typeof Notification>;
export type NotificationFeed = z.infer<typeof NotificationFeed>;

export const EscalationPolicy = z.object({
  urgent_sla_minutes: z.number(),
  routine_sla_minutes: z.number(),
  failed_retry_ceiling: z.number(),
  escalate_to_user_id: z.string().nullable(),
});
export type EscalationPolicy = z.infer<typeof EscalationPolicy>;

export const ReportSummary = z.object({
  mis_file_rate: z.number(),
  median_turnaround_seconds: z.number(),
  auto_file_pct: z.number(),
  urgent_sla_adherence_pct: z.number(),
  per_provider: z.array(z.object({
    provider_id: z.string(),
    name: z.string(),
    filed: z.number(),
  })),
});
export type ReportSummary = z.infer<typeof ReportSummary>;

export const OrgAuditEntry = z.object({
  id: z.string(),
  event_type: z.string(),
  actor: z.string(),
  detail: z.any().nullable(),
  created_at: z.string(),
});
export type OrgAuditEntry = z.infer<typeof OrgAuditEntry>;
