import { startEnroll } from "./actions";
import { EnrollForm } from "./EnrollForm";

export const dynamic = "force-dynamic";

export default async function MfaEnrollPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-slate-600">Missing enrollment token. Please log in again.</p>
      </div>
    );
  }
  const { otpauthUrl } = await startEnroll(token);
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
        <h1 className="text-lg font-semibold text-slate-900">Set up two-factor authentication</h1>
        <p className="text-sm text-slate-600">
          Your account role requires MFA. Scan this in your authenticator app, then enter a code.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(otpauthUrl)}`}
          alt="MFA QR code"
          className="mx-auto h-36 w-36"
        />
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer">Can&apos;t scan? Enter this key manually</summary>
          <code className="mt-2 block break-all rounded border border-slate-200 bg-slate-50 p-2">{otpauthUrl}</code>
        </details>
        <EnrollForm token={token} />
      </div>
    </div>
  );
}
