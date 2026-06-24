/**
 * Client-side password strength policy. Kept in sync with the backend's
 * inbound-docs-api/src/auth/password.policy.ts so the form gives immediate
 * feedback that matches what the server enforces.
 *
 * Rules: at least 8 characters, one uppercase letter, one lowercase letter,
 * and one number.
 */
export const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "A number", test: (p) => /[0-9]/.test(p) },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}
