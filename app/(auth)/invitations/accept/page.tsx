import { publicApi } from "@/lib/api";
import { AcceptForm } from "./AcceptForm";

export default async function AcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const inv = token ? await publicApi.getInvite(token) : null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xl font-semibold text-indigo-600">Inbound Docs</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Accept invitation</h1>

        {!inv ? (
          <>
            <p className="mt-3 text-sm text-red-600">Invalid or expired invitation link.</p>
            <a href="/login" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
              Back to sign in
            </a>
          </>
        ) : (
          <AcceptForm token={token!} email={inv.email} role={inv.role} />
        )}
      </div>
    </div>
  );
}
