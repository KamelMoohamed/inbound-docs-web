import { api } from "@/lib/api";
import { ReviewTable } from "@/components/ReviewTable";
import { Badge } from "@/components/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { QueueToggle } from "@/components/QueueToggle";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mine?: string }>;
}) {
  const { mine } = await searchParams;
  const items = mine ? await api.myQueue() : await api.listReview();
  const urgent = items.filter((i) => i.urgency === "urgent").length;
  return (
    <section>
      <PageHeader
        title={mine ? "My queue" : "Documents to review"}
        actions={
          <>
            <QueueToggle mine={!!mine} />
            <Badge tone="muted">{items.length} total</Badge>
            {urgent > 0 && <Badge tone="danger">{urgent} urgent</Badge>}
          </>
        }
      />
      <ReviewTable items={items} />
    </section>
  );
}
