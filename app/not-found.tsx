import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white text-center text-slate-900" suppressHydrationWarning>
        <p className="text-sm font-semibold text-indigo-600">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you’re looking for doesn’t exist.</p>
        <Link href="/" className="mt-6 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Back to home
        </Link>
      </body>
    </html>
  );
}
