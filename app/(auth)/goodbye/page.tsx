export default function GoodbyePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-lg font-semibold text-slate-900">Account deleted</h1>
        <p className="mt-2 text-sm text-slate-600">Your organisation and all associated data have been removed.</p>
        <a href="/signup" className="mt-4 inline-block text-indigo-600 hover:underline">Create a new organisation</a>
      </div>
    </div>
  );
}
