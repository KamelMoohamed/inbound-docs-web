import "../globals.css";
import { Nav } from "@/components/Nav";
import { LowCreditBanner } from "@/components/LowCreditBanner";
import { VerifyBanner } from "@/components/VerifyBanner";
import { BillingBanner } from "@/components/BillingBanner";
import { ImpersonatingBanner } from "@/components/ImpersonatingBanner";

export const metadata = { title: "Inbound Docs" };

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900" suppressHydrationWarning>
        <Nav />
        <ImpersonatingBanner />
        <VerifyBanner />
        <BillingBanner />
        <LowCreditBanner />
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
