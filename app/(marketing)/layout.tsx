import "../globals.css";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { baseMetadata, baseViewport, structuredData } from "@/lib/seo";

export const metadata = baseMetadata;
export const viewport = baseViewport;

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="min-h-screen bg-white text-slate-900" suppressHydrationWarning>
        <script
          type="application/ld+json"
          // schema.org structured data for richer search results.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
        <MarketingHeader />
        <main>{children}</main>
        <MarketingFooter />
      </body>
    </html>
  );
}
