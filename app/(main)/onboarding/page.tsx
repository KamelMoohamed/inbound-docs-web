import { api } from "@/lib/api";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { dismissOnboardingAction } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const status = await api.onboarding();
  return (
    <section className="max-w-lg">
      <PageHeader title="Onboarding" subtitle="Complete these steps to get the most from CliniDoc" />
      <OnboardingChecklist status={status} dismiss={dismissOnboardingAction} />
    </section>
  );
}
