import { HelpDoc } from "@/components/marketing/HelpDoc";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cliniko integration",
  description:
    "How to connect CliniDoc to Cliniko: what data is accessed, how to set up your API key, and how to disconnect.",
  path: "/help/cliniko",
});

const link = "font-medium text-indigo-600 hover:text-indigo-700";

export default function ClinikoHelpPage() {
  return (
    <HelpDoc
      title="Cliniko integration"
      sections={[
        {
          heading: "What this integration does",
          body: (
            <>
              CliniDoc pulls your Cliniko patient roster to match incoming documents — pathology results,
              specialist letters, faxes — to the correct patient. Once you confirm a document in CliniDoc,
              it is filed directly into Cliniko against that patient&apos;s record.
            </>
          ),
        },
        {
          heading: "Before you start",
          body: (
            <>
              You need an active CliniDoc account and a Cliniko account with API access. Cliniko API keys
              are available on all Cliniko plans — you do not need to upgrade.
            </>
          ),
        },
        {
          heading: "How to connect",
          body: (
            <>
              You will need your Cliniko API key. You can find it in Cliniko under{" "}
              <strong className="font-medium text-slate-800">My Info → API Key</strong>.
            </>
          ),
          steps: [
            "In CliniDoc, go to Settings → Integrations.",
            "Select Cliniko.",
            "Enter your Cliniko API key.",
            "Click Connect. CliniDoc will sync your patient roster immediately.",
          ],
        },
        {
          heading: "What data is accessed",
          body: (
            <>
              CliniDoc reads patient names, dates of birth, and contact details from Cliniko. This access
              is read-only. No clinical notes or billing data is accessed. The only data written to Cliniko
              is documents you have confirmed and filed through CliniDoc.
            </>
          ),
        },
        {
          heading: "Disconnecting",
          body: (
            <>
              Go to <strong className="font-medium text-slate-800">Settings → Integrations → Cliniko</strong>{" "}
              and click <strong className="font-medium text-slate-800">Disconnect</strong>. This stops roster
              sync but does not delete any documents already filed in Cliniko.
            </>
          ),
        },
        {
          heading: "Troubleshooting",
          body: (
            <>
              If the connection fails, check that your API key is correct and has not been rotated in
              Cliniko. If the issue persists, contact{" "}
              <a className={link} href="mailto:support@clinidoc.com.au">
                support@clinidoc.com.au
              </a>
              .
            </>
          ),
        },
      ]}
    />
  );
}
