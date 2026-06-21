"use client";

export function DispositionMenu({
  discard,
  markDuplicate,
}: {
  discard: (formData: FormData) => void | Promise<void>;
  markDuplicate: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="flex gap-2">
      <form action={discard}>
        <input type="hidden" name="reason" value="not clinically relevant" />
        <button type="submit" className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">
          Discard
        </button>
      </form>
      <form action={markDuplicate}>
        <input name="of_id" placeholder="Original doc ID" className="rounded border border-slate-300 px-2 py-1 text-xs" />
        <button type="submit" className="ml-1 rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
          Mark duplicate
        </button>
      </form>
    </div>
  );
}
