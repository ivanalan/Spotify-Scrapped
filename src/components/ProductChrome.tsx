"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackOriginBackPath } from "@/lib/origin-back";
import { cn } from "@/lib/utils";

/**
 * Full-bleed Orbit surfaces (no product nav / max-w shell).
 * Plus/Lab keep the editorial chrome.
 */
function isFullBleedScrapped(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/example" ||
    pathname === "/ready"
  );
}

export function ProductNavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isFullBleedScrapped(pathname)) return null;
  return children;
}

export function ProductMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullBleed = isFullBleedScrapped(pathname);

  useEffect(() => {
    trackOriginBackPath(pathname);
  }, [pathname]);

  return (
    <main
      id="main"
      className={cn(
        "w-full flex-1",
        fullBleed
          ? "mx-0 max-w-none px-0 py-0"
          : "mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-24",
      )}
    >
      {children}
    </main>
  );
}
