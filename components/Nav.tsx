import { Suspense } from "react";
import { NavLinks } from "./NavLinks";
import { Brand } from "@/components/Brand";
import { NavAccount } from "./NavAccount";
import { NavAccountSkeleton } from "./NavAccountSkeleton";

export function Nav() {
  return (
    <nav className="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <Brand href="/" iconSize={24} textClass="text-base" className="mr-4" />
      <NavLinks />
      <Suspense fallback={<NavAccountSkeleton />}>
        <NavAccount />
      </Suspense>
    </nav>
  );
}
