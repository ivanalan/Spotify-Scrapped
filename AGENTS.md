# AGENTS.md: Spotify Scrapped

Personal web app focused on **Spotify Scrapped**: an anti-Wrapped for songs that got ghosted:

1. **Scrapped** (`/scrapped`): story deck from Spotify Web API only (tops, recently played, liked, playlists). Affinity proxies, not true skips.
2. **Scrapped Plus** (`/scrapped/plus`): skip-based story deck from Extended Streaming History (SQLite after ingest).
3. **Scrapped Lab** (`/scrapped/lab`): same API metrics as a searchable list (calculated, means, bar definitions).

## Agent memory

> The file is the memory, not the conversation.

| File | Answers |
|------|---------|
| [AGENTS.md](AGENTS.md) | How do we work here? |
| [SOUL.md](SOUL.md) | What must we protect? |
| [SCARS.md](SCARS.md) | What has already hurt us? |
| [docs/decisions/](docs/decisions/) | What did we choose, and at what cost? |

Portable kit (copy to other repos): [docs/agent-framework/README.md](docs/agent-framework/README.md).

**Loop:** Start (read SOUL; SCARS if diagnosing) → Plan → Build → Decide (`D-NNN`) → Hand off (append SCARS if something hurt). Ship docs in the **same commit** as the change. Point to sources of truth; don’t paste them everywhere. Name the incident when you add a rule.

Always-on rules: [.cursor/rules/agent-memory.mdc](.cursor/rules/agent-memory.mdc), [.cursor/rules/spotify-data.mdc](.cursor/rules/spotify-data.mdc).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- **UI primitives:** shadcn under `src/components/ui/` for standard controls (Button, AlertDialog, etc.): [D-003](docs/decisions/D-003-shadcn-standard-controls.md)
- **UI type:** Poppins (`@fontsource/poppins`) via `--font-sans` / `--font-heading` / `--font-display` in `src/app/globals.css`. Type roles: `text-display`, `text-title`, `text-body`, `text-caption`.
- **Viewport:** mobile-first practices, responsive full-bleed surfaces ([D-002](docs/decisions/D-002-poppins-mobile-first.md), [SOUL.md](SOUL.md)).
- Ionicons for icons
- Local SQLite via `better-sqlite3` (`data/processed/history.db`) for Scrapped Plus
- Ingest: `npm run ingest` → `scripts/ingest.ts`
- Spotify Web API OAuth (`src/lib/spotify/`, `/api/spotify/*`) for Scrapped, Scrapped Lab, and Liked join on Plus

## Analysis vs enrichment

- **Scrapped Plus source of truth:** Extended Streaming History (skips, `ms_played`, `reason_end`).
- **Scrapped / Scrapped Lab:** affinity windows + library timestamps: proxies for “got ghosted,” not true skips.
- Access tokens stay server-side (`getSpotifyAccessToken` / `spotifyFetch`).

See **[docs/DATA.md](docs/DATA.md)** and **[docs/WRAPPED.md](docs/WRAPPED.md)** (Wrapped beat grammar → Scrapped narrative). OAuth + Web API helpers: `src/lib/spotify/` (local ops runbook gitignored). Official Wrapped **motion** keyframes: **[docs/mocks/wrapped-ref/](docs/mocks/wrapped-ref/)** (see WRAPPED.md §10). Story copy vs 5-row list motion: **[D-001](docs/decisions/D-001-story-copy-vs-list-motion.md)**.

## Non-goals (for now)

- No Prune / Eras / Scatter surfaces
- No automatic playlist edits

## Data

- Raw export (gitignored): `data/raw/Spotify Extended Streaming History/`
- Processed DB (gitignored): `data/processed/history.db`

## Key invariants

- `ts` is stream **end** time (UTC), not start.
- `skipped` is unreliable before ~2022: use `reason_end` + duration heuristics.
- Prefer `sum(ms_played)` over play counts for export analytics.
- Never persist or display `ip_addr`.
- Music entity key: `spotify_track_uri`.
- Spotify access tokens stay server-side.
- Story **copy** motion is shared across slides; only the numbered 5-row list pattern is special ([D-001](docs/decisions/D-001-story-copy-vs-list-motion.md), [SOUL.md](SOUL.md)).
- Typeface is Poppins; layouts are mobile-first and responsive full-bleed ([D-002](docs/decisions/D-002-poppins-mobile-first.md)).
- Standard buttons/controls use shadcn (`src/components/ui/`), not hand-rolled skins ([D-003](docs/decisions/D-003-shadcn-standard-controls.md)).
- Button tap height is **40px** (`h-10` / `size-10`) everywhere; no one-off height overrides ([D-026](docs/decisions/D-026-button-tap-target-40.md)).
- Auth copy is **sign in** / **sign out** only; not log in/out or connect/disconnect ([D-004](docs/decisions/D-004-sign-in-sign-out-copy.md)).
- API story deck copy is **handwritten** and locked; don’t regenerate lines casually ([D-005](docs/decisions/D-005-handwritten-api-story-copy.md)).
- API story headlines: ≤6 words, open compounds, **favs**, **1 like** ([D-006](docs/decisions/D-006-api-story-headline-style.md)).
- API deck look: Orbit Cascade palette + peripheral ovals / volume ocean ([D-007](docs/decisions/D-007-orbit-cascade-api-deck.md)); each story is dark or light; deck chrome follows the active slide.
- #1 artist oval ladder ([D-008](docs/decisions/D-008-entity-artist-opaque-orbit-ovals.md)) remains as grammar; live left-on-read entity uses TL typing pin ([D-017](docs/decisions/D-017-entity-list-pair-rhymes.md)).
- Wide viewport orbit art: corner-pinned motifs; phone keeps legacy `MotifStage` slice except intro + soft-close / middeck full-bleed layers ([D-009](docs/decisions/D-009-responsive-motif-pins.md), [D-016](docs/decisions/D-016-middeck-metaphor-promote.md)).
- Ghosted songs: entity grass + cover-TL haunt (slow fade) + entity S9 grow-in → list TR-corner moon + 5 slow-fade-then-float ghosts + C8 scrim ([D-018](docs/decisions/D-018-ghosted-ground-sky-s9.md)). Grass enter: rise-from-soil cascade, not `scaleY` ([D-021](docs/decisions/D-021-ghosted-grass-rise-from-soil.md)).
- **Scrapped** logo / wordmark is always italic ([D-011](docs/decisions/D-011-scrapped-logo-italic.md)); body copy stays roman.
- Share finale: inset **9:16** card + Share / Replay ([D-012](docs/decisions/D-012-share-finale-inset.md)); locked **300×533** design canvas scaled to the shell; liked metrics in flow under lists; production: ink stage · plain teal · TR moon · mixed-z hero ghosts · centered `myscrapped.com` ([D-033](docs/decisions/D-033-share-finale-b2-plain-teal.md); prior D-021 nest/orchid [D-021](docs/decisions/D-021-share-finale-teal-orchid-lilac-moon.md)). Stage/card split: [D-013](docs/decisions/D-013-share-finale-deck-rhyme-explore.md).
- List beats: art **frames** the list at the edges; no mid-band hero that occludes type/rows ([D-015](docs/decisions/D-015-list-art-frames-not-heroes.md)).
- Soft close: **Teal** field · mono teal iris shrink (8B); [D-016](docs/decisions/D-016-middeck-metaphor-promote.md).
- Middeck metaphors (scenes 4-8): 4A heart · T1 typing pin · 7L film letterbox · 8B teal iris; [D-016](docs/decisions/D-016-middeck-metaphor-promote.md), [D-017](docs/decisions/D-017-entity-list-pair-rhymes.md).
- Left on read 5→6: ink + B1 orchid-corner wash · tuned pin/frame; [D-019](docs/decisions/D-019-left-on-read-orchid-corners.md).
- Gate About (top-left) + `/about` Layout A; gate intro disks kit D6 (dim + down/outboard + top scrim); [D-022](docs/decisions/D-022-about-page-gate-d6.md). Privacy is `/about#privacy` (not a separate route); waitlist helper links there; [D-036](docs/decisions/D-036-about-privacy-waitlist-consent.md).
- No in-deck Spotify attribution or song navigation (covers/rows display-only; no “Content from Spotify”); PNG stays Scrapped-first; [D-038](docs/decisions/D-038-no-deck-spotify-attribution.md) (supersedes [D-037](docs/decisions/D-037-spotify-content-attribution.md)).
- Gate chrome triad: primary fill · secondary outline glass · tertiary underline (no bg); [D-023](docs/decisions/D-023-gate-button-triad.md).
- Example walkthrough: frozen Guest `ScrappedApiReport` at `/example`; About “What is this?” CTA; back chrome, no sign-out X; [D-024](docs/decisions/D-024-example-walkthrough-snapshot.md).
- Not-allowlisted OAuth: seats-full mid band (About only; no Sign out) + waitlist + footer Sign in + example / why links; [D-025](docs/decisions/D-025-not-allowlisted-seats-full-gate.md), [D-027](docs/decisions/D-027-sign-in-under-waitlist.md).
- Unsigned gate: no top-right **Sign in**: path is gate footer link; [D-027](docs/decisions/D-027-sign-in-under-waitlist.md).
- Blob ghost hem: **four tiny scallops** (not two-bump wave); [D-028](docs/decisions/D-028-ghost-four-scallop-hem.md).
- Blob ghost face: **ink outline + blush** (no mouth); [D-029](docs/decisions/D-029-ghost-outline-blush.md).
- List ghosts enter: **E3** outer-edge slide → land → local bob + random blink; [D-030](docs/decisions/D-030-ghost-e3-slide-enter-random-blink.md).
- No dash punctuation in writing (`—`, `--`, spaced `-` as clause breaks). Use sentences, semicolons, or colons ([D-030](docs/decisions/D-030-no-dash-punctuation.md)).
- Tab / app hide sticky-pauses the API story; stay paused on return ([D-031](docs/decisions/D-031-pause-on-tab-hide.md)).
- Seat invite: local `npm run invite -- <email>…` (1–5) via Resend template `seat-invite`; CTA `/ready` (off-waitlist Sign in, ~24h copy). Spotify allowlist rotation stays manual ([D-035](docs/decisions/D-035-local-invite-script-resend-template.md), [D-032](docs/decisions/D-032-seat-invite-ready-resend.md)).
- Global 404 is simple ink + orchid wash, logo top, centered mid, one Go home ([D-034](docs/decisions/D-034-simple-404-orchid-wash.md)).

## Layout

```
AGENTS.md
SOUL.md
SCARS.md
docs/agent-framework/     # portable kit
docs/decisions/           # D-NNN locked choices
docs/DATA.md
docs/WRAPPED.md            # Wrapped UX → Scrapped story spine
# docs/SPOTIFY_API.md, docs/WAITLIST.md: local ops only (gitignored)
data/raw/                 # gitignored
data/processed/           # gitignored
scripts/ingest.ts
src/app/scrapped/         # main deck + Plus + Lab
src/app/api/spotify/      # OAuth
src/lib/scrapped*.ts      # export + API metrics
src/lib/spotify/          # OAuth + listening helpers
src/components/scrapped/
```
