import { RequestForm } from "./RequestForm";
import { submitRequest } from "./actions";

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const { submitted } = await searchParams;
  return (
    <main className="max-w-2xl mx-auto p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Request a PMS integration</h1>
      {submitted ? (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="font-medium">Thanks — we&apos;ve logged your request.</p>
          <p className="text-sm text-gray-600 mt-1">
            You can start using us today in export mode, and we&apos;ll email you the moment this PMS is live.
          </p>
        </div>
      ) : (
        <>
          <p className="text-gray-600">Tell us which PMS your clinic uses. This directly shapes what we build next.</p>
          <RequestForm action={submitRequest} />
        </>
      )}
    </main>
  );
}
