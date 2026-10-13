"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Main Scrapped (`/`) is full-bleed; Plus/Lab keep the editorial shell. */
function isMainScrapped(pathname: string): boolean {
  return pathname === "/";
}

export function ProductNavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isMainScrapped(pathname)) return null;
  return children;
}

export function ProductMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const main = isMainScrapped(pathname);

  return (
    <main
      id="main"
      className={cn(
        "w-full flex-1",
        main
          ? "mx-0 max-w-none px-0 py-0"
          : "mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-24",
      )}
    >
      {children}
    </main>
  );
}
