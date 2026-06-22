import { Section } from "@/components/marketing/Section";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact — Inbound Docs",
  description: "Book a demo and see how Inbound Docs fits your practice workflow.",
};

export default function ContactPage() {
  return (
    <Section className="max-w-xl">
      <h1 className="text-3xl font-bold text-slate-900">Book a demo</h1>
      <p className="mt-3 text-slate-600">Tell us about your practice and we’ll show you Inbound Docs on your workflow.</p>
      <div className="mt-8"><ContactForm /></div>
    </Section>
  );
}
