import "../globals.css";
import { requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin — CliniDoc" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (session.platformRole !== "super_admin") redirect("/inbox");
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100" suppressHydrationWarning>
        <header className="border-b border-slate-700 px-6 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <span className="font-semibold">CliniDoc Admin</span>
            <a href="/" className="text-sm text-slate-400 hover:text-white">Exit admin</a>
          </div>
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
