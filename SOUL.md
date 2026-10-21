# SOUL.md — Spotify Scrapped

What must not change when the rules run out.  
Rules tell an agent **how**. This file tells it **what to protect**.

## The fantasy

Scrapped is an **anti-Wrapped conversation** — dry, slightly merciful, text-first.  
It is a ritual for songs and artists that got ghosted: affinity dips, one-likes, reunions — not a neon party and not a claim of true skips from the Web API.

## Non-negotiables

- **Data honesty** — Extended Streaming History is skip truth on Plus. Scrapped / Lab use affinity proxies only; never claim true skips from tops/library.
- **Privacy** — Never commit, log, or render `ip_addr`.
- **Tokens** — Spotify access tokens stay server-side.
- **Mobile-first, responsive** — Design for the phone first, then scale. Surfaces fill the viewport (no dark letterbox gutters). Do not build desktop-centered marketing posters. See [D-002](docs/decisions/D-002-poppins-mobile-first.md).
- **Story copy motion** — Title, subline, aside, and outro use the **same** enter/layout/exit pattern on every slide. Setup beats before a list are not special.
- **List exception only** — The numbered 5-row entity list (`WrappedEntityList` cascade, top-pinned list beat, support phase after copy) is the sole story-motion exception. See [D-001](docs/decisions/D-001-story-copy-vs-list-motion.md).

## Kill switch (defer by default)

- Inventing a new UI paradigm for `/scrapped` “just for this beat”
- Special-casing one slide’s **copy** motion instead of fixing the shared pattern
- Touching more than three unrelated systems without an explicit slice / stop line

## Who we write for

Lead with the **consequence for the listener** (what they feel / understand on the slide), not the mechanism (Framer props, flex tricks, API quirks).

Point to sources of truth — don’t paste them into every file.
