import Link from "next/link";
import { gateTertiaryTone } from "@/components/scrapped/gateChrome";
import { ScrappedOrbitArt } from "@/components/scrapped/orbit/ScrappedOrbitArt";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Replace when a hosted sample Scrapped walkthrough exists.
 * Empty string hides the CTA rather than shipping a dead link.
 */
const EXAMPLE_WALKTHROUGH_HREF =
  process.env.NEXT_PUBLIC_SCRAPPED_WALKTHROUGH_URL?.trim() || "";

/** Tertiary — no fill; underline fades in on hover (D-023). */
const backClass = cn(
  buttonVariants({ variant: "link", size: "lg" }),
  gateTertiaryTone,
  "-ml-3 h-10 px-3",
);

const walkLinkClass = cn(
  "mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[var(--wrapped-ink)]/22 bg-[var(--wrapped-ink)]/6 px-3 py-2.5 text-sm font-semibold text-[var(--wrapped-ink)] no-underline transition-colors hover:bg-[var(--wrapped-ink)]/12",
);

/**
 * About / FAQ — Layout A long-scroll editorial (D-022).
 * Same Orbit ink field as the gate; art is blurred + frosted so body copy stays primary.
 */
export function ScrappedAboutPage() {
  return (
    <div
      className="wrapped-story relative grid min-h-dvh w-full overflow-x-hidden"
      data-wrapped-tone="ink"
      data-scrapped-field="intro-dusk"
    >
      {/* About-only: blur motifs. Clip scale so it can’t add scroll below the frost. */}
      <div
        className="pointer-events-none col-start-1 row-start-1 min-h-dvh w-full overflow-hidden"
        aria-hidden
      >
        <div className="h-full min-h-full w-full scale-110">
          <ScrappedOrbitArt
            slideIndex={0}
            pattern="intro"
            active
            introKit="gate-d6"
          />
        </div>
      </div>
      <div
        className="pointer-events-none col-start-1 row-start-1 min-h-dvh w-full bg-[var(--wrapped-canvas)]/40 backdrop-blur-2xl"
        aria-hidden
      />

      <div className="relative z-10 col-start-1 row-start-1 flex w-full justify-center px-10">
        <div className="flex w-full max-w-sm flex-col items-stretch py-10 text-left">
          <div className="mb-6 flex w-full shrink-0 justify-start">
            <Link href="/" className={backClass}>
              ← Back
            </Link>
          </div>

          <h1 className="text-display w-full italic text-[var(--wrapped-ink)]">
            Scrapped
          </h1>
          <p className="text-body mt-4 w-full text-[var(--wrapped-muted)]">
            An anti-Wrapped for songs and artists that got ghosted. Old favorites
            that you stopped listening to and artists with just one liked song.
          </p>

          <section className="mt-10 w-full border-t border-[var(--wrapped-ink)]/14 pt-8">
            <h2 className="text-title w-full text-[var(--wrapped-ink)]">
              What is this?
            </h2>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              A short story deck built from your Spotify listening data: liked
              songs, 4 and 6 month tops, and all-time favorites.
            </p>
            {EXAMPLE_WALKTHROUGH_HREF ? (
              <a
                className={walkLinkClass}
                href={EXAMPLE_WALKTHROUGH_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                View an example
                <span aria-hidden className="text-[var(--wrapped-muted)]">
                  →
                </span>
              </a>
            ) : (
              <p className="text-caption mt-4 w-full text-[var(--wrapped-muted)]">
                Example walkthrough coming soon.
              </p>
            )}
          </section>

          <section className="mt-8 w-full border-t border-[var(--wrapped-ink)]/14 pt-8">
            <h2 className="text-title w-full text-[var(--wrapped-ink)]">
              Why a waitlist?
            </h2>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              The Spotify API limits the amount of users that are able to log in.
            </p>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              Join with the email on your Spotify account, and when a slot opens,
              we&rsquo;ll email you an invite link.
            </p>
          </section>

          <section className="mt-8 w-full border-t border-[var(--wrapped-ink)]/14 pt-8">
            <h2 className="text-title w-full text-[var(--wrapped-ink)]">
              Not affiliated with Spotify
            </h2>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              Scrapped is an independent fan project. It is not affiliated with,
              endorsed by, or sponsored by Spotify AB.
            </p>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              Spotify and related marks are trademarks of Spotify AB. This site
              uses the Spotify Web API under Spotify&rsquo;s developer terms; your
              listening data stays yours.
            </p>
          </section>

          <section className="mt-8 w-full border-t border-[var(--wrapped-ink)]/14 pt-8 pb-6">
            <h2 className="text-title w-full text-[var(--wrapped-ink)]">
              Do you store my password?
            </h2>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              No. Sign-in goes through Spotify OAuth. Access tokens stay
              server-side.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
