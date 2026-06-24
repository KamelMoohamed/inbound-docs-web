import "../globals.css";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { AppBanners } from "@/components/AppBanners";
import { ImpersonatingBanner } from "@/components/ImpersonatingBanner";
import { noindexMetadata, baseViewport } from "@/lib/seo";

export const metadata = { ...noindexMetadata, title: "CliniDoc" };
export const viewport = baseViewport;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900" suppressHydrationWarning>
        <Nav />
        <ImpersonatingBanner />
        <Suspense fallback={null}>
          <AppBanners />
        </Suspense>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
