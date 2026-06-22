import { LegalDoc } from "@/components/marketing/LegalDoc";

export const metadata = { title: "Data Processing Agreement — CliniDoc" };

const link = "font-medium text-indigo-600 hover:text-indigo-700";

export default function DpaPage() {
  return (
    <LegalDoc
      title="Data Processing Agreement"
      updated="22 June 2026"
      notice={
        <>
          <strong className="font-semibold">Owner:</strong> this is a working draft — have it reviewed by an
          Australian privacy lawyer before go-live. It must reflect the Privacy Act 1988 (Cth) and the Australian
          Privacy Principles (APPs).
        </>
      }
      intro={
        <>
          This Data Processing Agreement (“DPA”) forms part of the{" "}
          <a className={link} href="/terms">Terms of Service</a> between Kamel Kamel (ABN 17 732 182 203)
          (“Processor”, “we”) and the practice that accepts it (“Controller”, “you”). By accepting at signup,
          the person accepting confirms they are authorised to bind the practice.
        </>
      }
      sections={[
        {
          heading: "Roles",
          body: (
            <>
              You are the data controller of the patient health information processed through the service. We act
              solely as your processor, handling that information on your documented instructions and only to
              provide the service.
            </>
          ),
        },
        {
          heading: "Purpose & scope",
          body: (
            <>
              We process incoming clinical documents to ingest, triage, match to a patient, flag urgency and queue
              them for your staff to review and file. We do not use patient health information for any other
              purpose, and never to train models or for marketing.
            </>
          ),
        },
        {
          heading: "Security",
          body: (
            <>
              We take reasonable steps to protect the information (APP 11): encryption in transit and at rest,
              access controls, multi-factor authentication for privileged accounts, audit logging, and onshore
              (Australian) hosting. Detail is in our <a className={link} href="/privacy">Privacy Policy</a>.
            </>
          ),
        },
        {
          heading: "Data minimisation & retention",
          body: (
            <>
              We hold the minimum data needed to operate and retain it only as long as necessary. Raw documents
              are purged on a short cycle once filed; persisted records are minimised. Retention periods are
              described in the Privacy Policy.
            </>
          ),
        },
        {
          heading: "Sub-processors",
          body: (
            <>
              We use the sub-processors listed at{" "}
              <a className={link} href="/sub-processors">sub-processors</a> (e.g. cloud hosting, AI extraction).
              We bind each to equivalent obligations and will give notice of material changes so you may object.
            </>
          ),
        },
        {
          heading: "Data breach",
          body: (
            <>
              We will notify you without undue delay on becoming aware of an eligible data breach affecting your
              data, and assist you in meeting your obligations under the Notifiable Data Breaches scheme.
            </>
          ),
        },
        {
          heading: "Your rights & assistance",
          body: (
            <>
              We will assist you, so far as reasonably possible, to respond to patient access/correction requests
              and regulator enquiries relating to the information we process for you.
            </>
          ),
        },
        {
          heading: "Return & deletion",
          body: (
            <>
              On termination, or on your request, we will return or securely delete your data within a defined
              period, except where retention is required by law.
            </>
          ),
        },
        {
          heading: "International transfers",
          body: (
            <>
              Data is hosted in Australia. We will not transfer it overseas without your authorisation and
              appropriate safeguards under the APPs.
            </>
          ),
        },
        {
          heading: "Contact",
          body: (
            <>
              Privacy / data questions:{" "}
              <a className={link} href="mailto:privacy@clinidoc.com.au">privacy@clinidoc.com.au</a>.
            </>
          ),
        },
      ]}
    />
  );
}
