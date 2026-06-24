import "../globals.css";
import { noindexMetadata, baseViewport } from "@/lib/seo";

export const metadata = { ...noindexMetadata, title: "CliniDoc" };
export const viewport = baseViewport;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
