export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 prose prose-slate">
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500">Last updated: 21 June 2026. <em>Owner: have these reviewed by an Australian lawyer before go-live.</em></p>

      <h2>1. Agreement</h2>
      <p>These terms govern your use of the Inbound Docs service operated by [legal entity, ABN]. By creating an account you accept these terms and our <a href="/privacy">Privacy Policy</a>.</p>

      <h2>2. The service</h2>
      <p>Inbound Docs ingests, triages, matches and files clinical documents on behalf of your practice. AI-assisted output is reviewed and confirmed by your staff before filing. The service does not provide medical advice.</p>

      <h2>3. Your responsibilities</h2>
      <p>You are responsible for obtaining patient consent as required, for the accuracy of your roster, for reviewing documents before filing, and for maintaining the security of your account credentials and MFA.</p>

      <h2>4. Data &amp; privacy</h2>
      <p>We act as a processor handling health information under your authority. Our handling is described in the <a href="/privacy">Privacy Policy</a> and any Data Processing Agreement signed with your practice. Sub-processors are listed at <a href="/sub-processors">/sub-processors</a>.</p>

      <h2>5. Fees</h2>
      <p>Paid plans are billed per the pricing in effect. Usage (documents processed, fax pages) may consume credits. Fees are non-refundable except as required by law.</p>

      <h2>6. Availability</h2>
      <p>We aim for high availability but do not guarantee uninterrupted service except where a separate SLA applies.</p>

      <h2>7. Acceptable use</h2>
      <p>You must not misuse the service, attempt to breach its security, or upload content you are not authorised to process.</p>

      <h2>8. Liability</h2>
      <p>To the extent permitted by law, our liability is limited as set out in your plan or agreement. Nothing limits rights that cannot be excluded under the Australian Consumer Law.</p>

      <h2>9. Termination</h2>
      <p>Either party may terminate per the plan terms. On termination we return or delete your data as described in the DPA / Privacy Policy.</p>

      <h2>10. Changes &amp; contact</h2>
      <p>We may update these terms; material changes will be notified. Questions: [legal@yourdomain].</p>
    </div>
  );
}
