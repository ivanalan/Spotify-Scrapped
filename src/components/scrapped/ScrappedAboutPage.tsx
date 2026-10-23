import Link from "next/link";
import {
  gateLinkChromeClass,
  gateSecondaryChromeClass,
} from "@/components/scrapped/gateChrome";
import { OriginBackButton } from "@/components/scrapped/OriginBackButton";
import { ScrappedOrbitArt } from "@/components/scrapped/orbit/ScrappedOrbitArt";
import { cn } from "@/lib/utils";

/**
 * About / FAQ: Layout A long-scroll editorial (D-022).
 * Same Orbit ink field as the gate; art is blurred + frosted so body copy stays primary.
 * Example walkthrough ingress under “What is this?” → `/example` (D-024).
 * ← Back: secondary chrome (D-023); returns to prior in-app screen (D-040); cold entry → `/`.
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
            <OriginBackButton
              className={gateSecondaryChromeClass}
              aria-label="Back"
            >
              ← Back
            </OriginBackButton>
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
              songs, 4-week and 6-month tops, and multi-year favorites.
            </p>
            <Link className={cn(gateLinkChromeClass, "mt-4")} href="/example">
              View an example
            </Link>
          </section>

          <section
            id="why-waitlist"
            className="mt-8 w-full scroll-mt-10 border-t border-[var(--wrapped-ink)]/14 pt-8"
          >
            <h2 className="text-title w-full text-[var(--wrapped-ink)]">
              Why a waitlist?
            </h2>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              The Spotify API limits the amount of users that are able to sign
              in.
            </p>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              Join with the email on your Spotify account, and when a slot opens,
              we&rsquo;ll email you a link to sign in.
            </p>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              Already have access?{" "}
              <a
                href="/api/spotify/login"
                className={cn(gateLinkChromeClass, "inline")}
                aria-label="Sign in to Spotify"
              >
                Sign in
              </a>
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
              uses the Spotify Web API under Spotify&rsquo;s developer terms.
            </p>
          </section>

          <section
            id="privacy"
            className="mt-8 w-full scroll-mt-10 border-t border-[var(--wrapped-ink)]/14 pt-8"
          >
            <h2 className="text-title w-full text-[var(--wrapped-ink)]">
              Privacy
            </h2>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              We never see your Spotify password. Sign in goes through Spotify
              OAuth. Access tokens stay in an encrypted cookie on our side for
              about 30 days, or until you sign out.
            </p>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              When you load Scrapped, we keep a sealed story snapshot in cookies
              (tops, liked songs, cover art URLs) for about 30 days so the deck
              can reopen without fetching again. Sign out clears those cookies.
            </p>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              If you join the waitlist, we store that email so we can send a seat
              invite. We only email waitlist addresses about access. To leave the
              waitlist, reply to a Scrapped seat email or write the From address
              on that invite from the address you joined with.
            </p>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              We don&rsquo;t sell your data.
            </p>
          </section>

          <section className="mt-8 w-full border-t border-[var(--wrapped-ink)]/14 pt-8 pb-6">
            <h2 className="text-title w-full text-[var(--wrapped-ink)]">
              Is this all of 2026?
            </h2>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              Not really :/
            </p>
            <p className="text-body mt-3 w-full text-[var(--wrapped-muted)]">
              Spotify only gives us your tops for ~4 weeks, ~6
              months, all-time, and Liked Songs. Ghosted
              and left on read compare on those time frames.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
