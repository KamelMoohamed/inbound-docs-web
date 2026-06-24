/**
 * Maximum accepted lengths for public form fields. Shared between the client
 * (`maxLength` on inputs) and the server actions (defence-in-depth guard) so a
 * crafted request that bypasses the browser is still rejected. Prevents oversized
 * payloads from being stored (DoS / storage-abuse vector).
 */
export const FIELD_LIMITS = {
  name: 200,
  email: 254, // RFC 5321 max email length
  practice: 200,
  message: 5000,
  pms_name: 200,
  clinic_name: 200,
  note: 5000,
} as const;

/** Returns true if any `[value, max]` pair exceeds its limit. */
export function anyTooLong(...pairs: [string, number][]): boolean {
  return pairs.some(([value, max]) => value.length > max);
}
