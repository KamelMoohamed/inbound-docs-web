import { uploadAction } from "./actions";

export default function UploadPage() {
  return (
    <section className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Upload a document</h1>
      <form action={uploadAction} className="space-y-3">
        <input type="file" name="file" required className="block w-full text-sm" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Upload</button>
      </form>
      <p className="mt-3 text-sm text-slate-500">It will appear in the review queue once the worker processes it.</p>
    </section>
  );
}
