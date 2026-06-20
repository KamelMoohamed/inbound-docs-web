import { api } from "@/lib/api";
import { ReviewTable } from "@/components/ReviewTable";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await api.listReview();
  const urgent = items.filter((i) => i.urgency === "urgent").length;
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold">Documents to review</h1>
        <Badge tone="muted">{items.length} total</Badge>
        {urgent > 0 && <Badge tone="danger">{urgent} urgent</Badge>}
      </div>
      <ReviewTable items={items} />
    </section>
  );
}
