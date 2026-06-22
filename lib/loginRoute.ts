export type LoginResponse = {
  access?: string;
  refresh?: string;
  mfa_required?: boolean;
  mfa_token?: string;
  mfa_enrollment_required?: boolean;
  enrol_token?: string;
};

export function routeAfterLogin(r: LoginResponse):
  | { kind: "session" }
  | { kind: "challenge"; token: string }
  | { kind: "enrol"; token: string } {
  if (r.mfa_enrollment_required && r.enrol_token) return { kind: "enrol", token: r.enrol_token };
  if (r.mfa_required && r.mfa_token) return { kind: "challenge", token: r.mfa_token };
  return { kind: "session" };
}
