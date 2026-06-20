"use client";
import { useActionState } from "react";
import { uploadAction } from "./actions";

export default function UploadPage() {
  const [state, action, pending] = useActionState(uploadAction, null);
  return (
    <section className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Upload a document</h1>
      <form action={action} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Document (image or PDF)
          <input
            type="file"
            name="file"
            required
            disabled={pending}
            className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white hover:file:bg-slate-700"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>
      {state && (
        <p
          className={`mt-3 rounded border p-3 text-sm ${
            state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      )}
    </section>
  );
}
