"use client";
import { PASSWORD_RULES } from "@/lib/password";

/** Live checklist of password-strength rules; turns green as each rule passes. */
export function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="mt-1 space-y-0.5 text-xs" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.label} className={ok ? "text-emerald-600" : "text-slate-400"}>
            <span aria-hidden>{ok ? "✓" : "○"}</span> {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
