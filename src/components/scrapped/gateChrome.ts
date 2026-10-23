import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Gate chrome tones on Orbit ink field (D-023, D-039).
 * Primary / secondary / tertiary / link: shadcn Button + product tone via className (D-003).
 */

/**
 * Shared hover ease: explicit props (not only duration on `transition-all`)
 * so fill / border / underline color actually interpolate.
 */
export const gateChromeTransition =
  "transition-[background-color,border-color,color,opacity,text-decoration-color] duration-300 ease-[var(--ease-out)]";

/** Primary fill tone: solid ink; hover mixes toward canvas (noticeably darker). */
export const gatePrimaryTone = cn(
  "cursor-pointer bg-[var(--wrapped-ink)] text-[var(--wrapped-canvas)] hover:bg-[color-mix(in_oklab,var(--wrapped-ink),var(--wrapped-canvas)_22%)] hover:text-[var(--wrapped-canvas)]",
  gateChromeTransition,
);

/** Secondary tone only: use with `<Button variant="outline" size="lg">` (40px · D-026). */
export const gateSecondaryTone = cn(
  "cursor-pointer border-[var(--wrapped-ink)]/25 !bg-[var(--wrapped-ink)]/16 !text-[var(--wrapped-ink)] backdrop-blur-md supports-backdrop-filter:!bg-[var(--wrapped-ink)]/16 hover:!border-[var(--wrapped-ink)]/50 hover:!bg-[var(--wrapped-ink)]/24 hover:!text-[var(--wrapped-ink)] aria-expanded:!border-[var(--wrapped-ink)]/25 aria-expanded:!bg-[var(--wrapped-ink)]/16 aria-expanded:!text-[var(--wrapped-ink)]",
  gateChromeTransition,
);

/**
 * Gate field chrome: same glass as secondary (D-023), for shadcn `Input`.
 * Type matches gate body (`text-body`: Poppins 1rem / 400); keep `text-base`
 * (and override Input `md:text-sm`) so iOS doesn’t zoom on focus.
 * Placeholder keeps muted ink; inherits size/weight from the field.
 */
export const gateFieldTone = cn(
  "border-[var(--wrapped-ink)]/25 !bg-[var(--wrapped-ink)]/16 text-base font-normal text-[var(--wrapped-ink)] md:text-base placeholder:text-[var(--wrapped-ink)]/45 backdrop-blur-md supports-backdrop-filter:!bg-[var(--wrapped-ink)]/14 focus-visible:border-[var(--wrapped-ink)]/50 focus-visible:ring-[var(--wrapped-ink)]/20 dark:!bg-[var(--wrapped-ink)]/16",
  gateChromeTransition,
);

/**
 * Tertiary: no fill, no underline. Hover wash is soft ink/6 (D-039).
 * Reserved chrome; About ← Back uses secondary (D-023).
 * Use with shadcn `ghost` via `gateTertiaryChromeClass`.
 */
export const gateTertiaryTone = cn(
  "cursor-pointer bg-transparent font-semibold text-[var(--wrapped-ink)] no-underline hover:!bg-[var(--wrapped-ink)]/6 hover:text-[var(--wrapped-ink)]",
  gateChromeTransition,
);

/**
 * Body link tone: ink + text-body; underline always (D-039).
 * About **View an example** · About **Sign in** · gate body inline helpers.
 */
export const gateLinkTone = cn(
  "cursor-pointer bg-transparent font-semibold text-body text-[var(--wrapped-ink)] underline underline-offset-4 decoration-[var(--wrapped-ink)] hover:bg-transparent hover:text-[var(--wrapped-ink)] hover:decoration-[var(--wrapped-ink)]",
  gateChromeTransition,
);

/**
 * Caption link tone: muted + text-caption; hover lifts to ink (D-039).
 * Gate footer **Sign in** · caption pairs. Waitlist **Privacy** uses this tone without underline.
 */
export const gateCaptionLinkTone = cn(
  "cursor-pointer bg-transparent font-semibold text-caption text-[var(--wrapped-muted)] underline underline-offset-4 decoration-[var(--wrapped-muted)] hover:bg-transparent hover:text-[var(--wrapped-ink)] hover:decoration-[var(--wrapped-ink)]",
  gateChromeTransition,
);

/** Secondary: full classes for `<Link>` / `<a>` (includes outline + lg). */
export const gateSecondaryChromeClass = cn(
  buttonVariants({ variant: "outline", size: "lg" }),
  gateSecondaryTone,
);

/**
 * Tertiary: full classes for `<Link>` / `<a>` (shadcn ghost + lg).
 * Reserved; About ← Back uses `gateSecondaryChromeClass` (D-023).
 */
export const gateTertiaryChromeClass = cn(
  buttonVariants({ variant: "ghost", size: "lg" }),
  gateTertiaryTone,
);

/**
 * Body link: shadcn `link` + ink / text-body (D-039).
 * Height/padding zeroed so type aligns with surrounding body; add `inline` in flow.
 */
export const gateLinkChromeClass = cn(
  buttonVariants({ variant: "link", size: "lg" }),
  gateLinkTone,
  "h-auto px-0",
);

/**
 * Caption link: shadcn `link` + muted / text-caption (D-039).
 * Height/padding zeroed for inline caption; add `inline` in flow.
 * Waitlist helper may add `text-xs` to match a tighter helper line.
 */
export const gateCaptionLinkChromeClass = cn(
  buttonVariants({ variant: "link", size: "lg" }),
  gateCaptionLinkTone,
  "h-auto px-0",
);
