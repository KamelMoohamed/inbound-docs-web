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
