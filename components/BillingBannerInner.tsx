"use client";
import Link from "next/link";

export function BillingBannerInner({
  past_due,
  grace_until,
}: {
  past_due: boolean;
  grace_until: string | null | undefined;
}) {
  if (!past_due) return null;
  const graceDate = grace_until ? new Date(grace_until) : null;
  const graceExpired = graceDate ? graceDate.getTime() < Date.now() : false;

  if (graceExpired) {
    return (
      <div className="border-b border-red-300 bg-red-50 px-6 py-2 text-center text-sm text-red-900">
        Processing paused — payment is overdue.{" "}
        <Link href="/billing" className="font-semibold underline">Update payment</Link>
      </div>
    );
  }

  const dateLabel = graceDate
    ? graceDate.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : "soon";

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-900">
      Payment failed — update your card by {dateLabel}.{" "}
      <Link href="/billing" className="font-semibold underline">Update payment</Link>
    </div>
  );
}
