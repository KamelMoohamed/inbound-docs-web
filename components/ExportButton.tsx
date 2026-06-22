"use client";

export function ExportButton({ onExport }: { onExport: () => void | Promise<void> }) {
  return (
    <button
      type="button"
      onClick={() => void onExport()}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
    >
      Export my data
    </button>
  );
}
