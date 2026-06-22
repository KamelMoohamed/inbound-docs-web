"use client";
import { ExportButton } from "@/components/ExportButton";
import { exportDataAction } from "./exportAction";

export function ExportDataButton() {
  const handleExport = async () => {
    const { data, filename } = await exportDataAction();
    const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return <ExportButton onExport={handleExport} />;
}
