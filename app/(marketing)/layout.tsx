import "../globals.css";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata = {
  title: "CliniDoc — clinical document triage for Australian practices",
  description: "Automatically triage, match and file inbound clinical documents. Onshore, encrypted, human-in-the-loop.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900" suppressHydrationWarning>
        <MarketingHeader />
        <main>{children}</main>
        <MarketingFooter />
      </body>
    </html>
  );
}
