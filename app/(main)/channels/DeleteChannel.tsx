"use client";
import { deleteChannelAction } from "./actions";

export function DeleteChannel({ id, type }: { id: string; type: string }) {
  const warn = type === "efax"
    ? "Delete this fax channel? The phone number will be released and cannot be recovered."
    : "Delete this channel?";
  return (
    <form action={deleteChannelAction.bind(null, id)}
      onSubmit={(e) => { if (!confirm(warn)) e.preventDefault(); }}>
      <button type="submit" className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50">
        Delete
      </button>
    </form>
  );
}
