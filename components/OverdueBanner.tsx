import type { Metrics } from "@/lib/types";
import { Card } from "./ui/Card";

export function OverdueBanner({ metrics }: { metrics: Metrics }) {
  if (metrics.urgent_pending <= 0) return null;
  return (
    <Card className="border-red-200 bg-red-50 text-sm text-red-800">
      <strong>Overdue urgent:</strong> {metrics.urgent_pending} document(s) past SLA — surface these first.
    </Card>
  );
}
