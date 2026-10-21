import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Gate chrome tones on Orbit ink field (D-023).
 * Primary / secondary / tertiary — shadcn Button + product tone via className (D-003).
 */

/**
 * Shared hover ease — explicit props (not only duration on `transition-all`)
 * so fill / border / underline color actually interpolate.
 */
export const gateChromeTransition =
  "transition-[background-color,border-color,color,opacity,text-decoration-color] duration-300 ease-[var(--ease-out)]";

/** Primary fill tone — solid ink; hover mixes toward canvas (noticeably darker). */
export const gatePrimaryTone = cn(
  "cursor-pointer bg-[var(--wrapped-ink)] text-[var(--wrapped-canvas)] hover:bg-[color-mix(in_oklab,var(--wrapped-ink),var(--wrapped-canvas)_22%)] hover:text-[var(--wrapped-canvas)]",
  gateChromeTransition,
);

/** Secondary tone only — use with `<Button variant="outline" size="lg">`. */
export const gateSecondaryTone = cn(
  "cursor-pointer border-[var(--wrapped-ink)]/25 !bg-[var(--wrapped-ink)]/10 !text-[var(--wrapped-ink)] backdrop-blur-md supports-backdrop-filter:!bg-[var(--wrapped-ink)]/8 hover:!border-[var(--wrapped-ink)]/50 hover:!bg-[var(--wrapped-ink)]/16 hover:!text-[var(--wrapped-ink)] aria-expanded:!border-[var(--wrapped-ink)]/25 aria-expanded:!bg-[var(--wrapped-ink)]/10 aria-expanded:!text-[var(--wrapped-ink)]",
  gateChromeTransition,
);

/**
 * Tertiary — underline always present; hover fades decoration in (D-023).
 * Toggling `underline` on/off cannot animate — only decoration-color can.
 */
export const gateTertiaryTone = cn(
  "cursor-pointer bg-transparent font-semibold text-[var(--wrapped-ink)] underline underline-offset-4 decoration-transparent hover:bg-transparent hover:text-[var(--wrapped-ink)] hover:decoration-[var(--wrapped-ink)]",
  gateChromeTransition,
);

/** Secondary — full classes for `<Link>` / `<a>` (includes outline + lg). */
export const gateSecondaryChromeClass = cn(
  buttonVariants({ variant: "outline", size: "lg" }),
  gateSecondaryTone,
);

/** Primary — solid ink fill (Sign in). */
export const gatePrimaryChromeClass = cn(
  buttonVariants({ size: "lg" }),
  gatePrimaryTone,
);
