import { Section } from "@/components/marketing/Section";
import { ContactForm } from "./ContactForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Book a demo and see how CliniDoc fits your practice workflow.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Section className="max-w-xl">
      <h1 className="text-3xl font-bold text-slate-900">Book a demo</h1>
      <p className="mt-3 text-slate-600">Tell us about your practice and we’ll show you CliniDoc on your workflow.</p>
      <div className="mt-8"><ContactForm /></div>
    </Section>
  );
}
