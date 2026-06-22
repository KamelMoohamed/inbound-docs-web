import Link from "next/link";
import { verifyEmail } from "@/lib/verifyEmail";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-lg font-semibold text-slate-900">Invalid link</h1>
          <p className="mt-2 text-sm text-slate-600">This verification link is missing a token.</p>
          <Link href="/login" className="mt-4 inline-block text-indigo-600 hover:underline">Sign in</Link>
        </div>
      </div>
    );
  }

  const result = await verifyEmail(token);

  if ("ok" in result && result.ok) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm text-center">
          <h1 className="text-lg font-semibold text-emerald-900">Trial unlocked</h1>
          <p className="mt-2 text-sm text-emerald-800">Your email is verified. You can now use your trial credits.</p>
          <Link href="/dashboard" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-red-200 bg-red-50 p-8 shadow-sm text-center">
        <h1 className="text-lg font-semibold text-red-900">Verification failed</h1>
        <p className="mt-2 text-sm text-red-800">{"error" in result ? result.error : "Verification failed."}</p>
        <p className="mt-4 text-sm text-slate-600">
          Sign in and use the resend option from your dashboard banner, or{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">sign in</Link>.
        </p>
      </div>
    </div>
  );
}
