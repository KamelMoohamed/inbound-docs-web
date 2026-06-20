import { z } from "zod";

export const ReviewItem = z.object({
  id: z.string(), doc_type: z.string().nullable(), urgency: z.string().nullable(),
  review_band: z.string().nullable(), matched_patient_id: z.string().nullable(),
  match_confidence: z.number().nullable(), summary: z.string().nullable(),
});
export type ReviewItem = z.infer<typeof ReviewItem>;

export const ReviewDetail = z.object({
  id: z.string(), status: z.string(), doc_type: z.string().nullable(), urgency: z.string().nullable(),
  extracted: z.any().nullable(), matched_patient_id: z.string().nullable(),
  match_confidence: z.number().nullable(), raw_uri: z.string(),
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
  plans: z.record(z.object({ monthlyCredits: z.number(), rolloverCap: z.number() })),
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
