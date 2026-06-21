"use client";
import Link from "next/link";

export function QueueToggle({ mine }: { mine: boolean }) {
  return (
    <div className="flex gap-2">
      <Link href="/"
        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${!mine ? "bg-indigo-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
        All queue
      </Link>
      <Link href="/?mine=1"
        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${mine ? "bg-indigo-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
        My queue
      </Link>
    </div>
  );
}
