import { CopyField } from "./CopyField";
import type { ChannelSetup } from "@/lib/types";

const SECRET_LABELS = ["Signing secret", "HMAC secret", "Bearer token", "Password"];

export function CredentialsPanel({ setup }: { setup: ChannelSetup }) {
  const hasSecret = Object.keys(setup.fields).some((k) => SECRET_LABELS.includes(k));
  return (
    <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
      <p className="mb-1 text-sm font-semibold text-emerald-900">
        {hasSecret ? "Channel created — copy the secret now" : "Channel ready"}
      </p>
      <p className="mb-3 text-xs text-emerald-800">
        {setup.instructions}{hasSecret ? " The secret is shown once." : ""}
      </p>
      <div className="space-y-3">
        {Object.entries(setup.fields).map(([label, value]) => (
          <CopyField key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}
