import { LegalDoc } from "@/components/marketing/LegalDoc";

export const metadata = { title: "Terms of Service — CliniDoc" };

const link = "font-medium text-indigo-600 hover:text-indigo-700";

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      updated="21 June 2026"
      notice={
        <>
          <strong className="font-semibold">Owner:</strong> have these terms reviewed by an Australian lawyer
          before go-live.
        </>
      }
      sections={[
        {
          heading: "Agreement",
          body: (
            <>
              These terms govern your use of the CliniDoc service, operated by Kamel Kamel (ABN 17 732 182 203).
              By creating an account you accept these terms and our{" "}
              <a className={link} href="/privacy">Privacy Policy</a>.
            </>
          ),
        },
        {
          heading: "The service",
          body: (
            <>
              CliniDoc ingests, triages, matches and files clinical documents on behalf of your practice.
              AI-assisted output is reviewed and confirmed by your staff before filing. The service does not
              provide medical advice.
            </>
          ),
        },
        {
          heading: "Your responsibilities",
          body: (
            <>
              You are responsible for obtaining patient consent as required, for the accuracy of your roster,
              for reviewing documents before filing, and for maintaining the security of your account
              credentials and MFA.
            </>
          ),
        },
        {
          heading: "Data & privacy",
          body: (
            <>
              We act as a processor handling health information under your authority. Our handling is described
              in the <a className={link} href="/privacy">Privacy Policy</a> and the{" "}
              <a className={link} href="/dpa">Data Processing Agreement</a> you accept. Sub-processors are listed
              at <a className={link} href="/sub-processors">sub-processors</a>.
            </>
          ),
        },
        {
          heading: "Fees",
          body: (
            <>
              Paid plans are billed per the pricing in effect. Usage (documents processed, fax pages) may consume
              credits. Fees are non-refundable except as required by law.
            </>
          ),
        },
        {
          heading: "Availability",
          body: (
            <>
              We aim for high availability but do not guarantee uninterrupted service except where a separate SLA
              applies.
            </>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <>
              You must not misuse the service, attempt to breach its security, or upload content you are not
              authorised to process.
            </>
          ),
        },
        {
          heading: "Liability",
          body: (
            <>
              To the extent permitted by law, our liability is limited as set out in your plan or agreement.
              Nothing limits rights that cannot be excluded under the Australian Consumer Law.
            </>
          ),
        },
        {
          heading: "Termination",
          body: (
            <>
              Either party may terminate per the plan terms. On termination we return or delete your data as
              described in the DPA and Privacy Policy.
            </>
          ),
        },
        {
          heading: "Changes & contact",
          body: (
            <>
              We may update these terms; material changes will be notified. Questions:{" "}
              <a className={link} href="mailto:legal@clinidoc.com.au">legal@clinidoc.com.au</a>.
            </>
          ),
        },
      ]}
    />
  );
}
