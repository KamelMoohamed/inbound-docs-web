export default function DpaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 prose prose-slate">
      <h1>Data Processing Agreement</h1>
      <p className="text-sm text-slate-500">
        Last updated: 22 June 2026. <em>Owner: this is a working draft — have it reviewed by an Australian
        privacy lawyer before go-live. It must reflect the Privacy Act 1988 (Cth) and the Australian Privacy
        Principles (APPs).</em>
      </p>

      <p>
        This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the <a href="/terms">Terms of Service</a>
        between Kamel Kamel (ABN 17 732 182 203) (&ldquo;Processor&rdquo;, &ldquo;we&rdquo;) and the practice that accepts it
        (&ldquo;Controller&rdquo;, &ldquo;you&rdquo;). By accepting at signup, the person accepting confirms they are
        authorised to bind the practice.
      </p>

      <h2>1. Roles</h2>
      <p>
        You are the data controller of the patient health information processed through the service. We act solely as
        your processor, handling that information on your documented instructions and only to provide the service.
      </p>

      <h2>2. Purpose &amp; scope</h2>
      <p>
        We process inbound clinical documents to ingest, triage, match to a patient, flag urgency and queue them for
        your staff to review and file. We do not use patient health information for any other purpose, and never to
        train models or for marketing.
      </p>

      <h2>3. Security</h2>
      <p>
        We take reasonable steps to protect the information (APP 11): encryption in transit and at rest, access
        controls, multi-factor authentication for privileged accounts, audit logging, and onshore (Australian)
        hosting. Detail is in our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>4. Data minimisation &amp; retention</h2>
      <p>
        We hold the minimum data needed to operate and retain it only as long as necessary. Raw documents are purged
        on a short cycle once filed; persisted records are minimised. Retention periods are described in the
        Privacy Policy.
      </p>

      <h2>5. Sub-processors</h2>
      <p>
        We use the sub-processors listed at <a href="/sub-processors">/sub-processors</a> (e.g. cloud hosting, AI
        extraction). We bind each to equivalent obligations and will give notice of material changes so you may object.
      </p>

      <h2>6. Data breach</h2>
      <p>
        We will notify you without undue delay on becoming aware of an eligible data breach affecting your data, and
        assist you in meeting your obligations under the Notifiable Data Breaches scheme.
      </p>

      <h2>7. Your rights &amp; assistance</h2>
      <p>
        We will assist you, so far as reasonably possible, to respond to patient access/correction requests and
        regulator enquiries relating to the information we process for you.
      </p>

      <h2>8. Return &amp; deletion</h2>
      <p>
        On termination, or on your request, we will return or securely delete your data within a defined period,
        except where retention is required by law.
      </p>

      <h2>9. International transfers</h2>
      <p>
        Data is hosted in Australia. We will not transfer it overseas without your authorisation and appropriate
        safeguards under the APPs.
      </p>

      <h2>10. Contact</h2>
      <p>Privacy / data questions: privacy@clinidoc.com.au.</p>
    </div>
  );
}
