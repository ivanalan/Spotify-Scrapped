import Link from "next/link";
import type { Metadata } from "next";
import { gatePrimaryTone } from "@/components/scrapped/gateChrome";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Not found: Scrapped",
  robots: { index: false, follow: false },
};

/**
 * Simple 404: ink + orchid wash, logo top, centered mid band (D-034).
 * Fixed full-bleed so unknown paths don’t inherit product nav / max-w shell.
 */
export default function NotFound() {
  return (
    <div
      className="wrapped-story fixed inset-0 z-50 flex flex-col items-center overflow-hidden px-10 py-10 text-center"
      data-wrapped-tone="ink"
      data-scrapped-field="intro-dusk"
    >
      <p className="text-title shrink-0 italic text-[var(--wrapped-ink)]">
        Scrapped
      </p>
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1 className="text-display text-[var(--wrapped-ink)]">
          Page not found
        </h1>
        <p className="text-body mt-3 max-w-xs text-[var(--wrapped-muted)]">
          Nothing lives at this URL.
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants({ size: "lg" }),
            gatePrimaryTone,
            "mt-8",
          )}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
