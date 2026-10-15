# Spotify Wrapped — Narrative Reference for Scrapped

**Purpose:** Capture how official Spotify Wrapped tells a year-in-listening story (2023–2025), so **Spotify Scrapped** can stay familiar in *form* while staying opposite in *meaning*.

Agents should read this before changing deck order, slide copy, share cards, or “anti-Wrapped” framing on `/scrapped`, `/scrapped/plus`, or `/scrapped/lab`.

**Not a product spec for cloning Wrapped.** Prefer invert / omit over parody of every yearly gimmick.

---

## 1. Why this matters for Scrapped

Wrapped trained millions of people on one interaction grammar:

1. Open app → hub → full-bleed story deck  
2. One idea per card  
3. Hero number / name → short list → optional personality beat → shareable finale  

Scrapped should feel like that same ritual for **what didn’t stick** (skips, almosts, rematches). Smooth narrative = same *beats and pacing*, inverted *metrics and emotional payoff*.

| Wrapped trains | Scrapped answers |
|----------------|------------------|
| Celebration of affinity | Receipt for rejection / revision |
| Minutes & play counts | Skips, skip rate, finish arcs |
| “This defined you” | “This almost did — or came back” |
| Share pride | Share honesty (same share-card ritual) |

Scrapped Plus (`history.db` skips) remains source of truth for true skips. Main Scrapped and Scrapped Lab use affinity proxies only — never claim true skips there (see [DATA.md](DATA.md), [SPOTIFY_API.md](SPOTIFY_API.md)).

---

## 2. UX grammar (stable across years)

### Entry

1. Update mobile app  
2. Home → **Wrapped** pill / banner (or search “Wrapped” / “YYYY Wrapped”)  
3. **Wrapped hub** (stories, playlists, clips, extras)  
4. Tap **Your YYYY Wrapped** → story starts (often with ambient audio)

### Story controls

| Action | Pattern |
|--------|---------|
| Next / previous | Tap edges or swipe (Stories-like); Scrapped uses vertical snap + arrows/keys |
| Pause | Hold (Wrapped); optional for us |
| Share | Per-card “Share this story” → static image / link |
| Replay | Hub replay or restart story (2025: speed + jump to moment) |
| Finale | Collage / summary with selectable visual treatments |

### Card anatomy (mental model)

Each beat is usually:

1. **Setup line** (one sentence of framing)  
2. **Reveal** (big number, name, list, or character)  
3. **Optional micro-stat** (plays, streak, percentile)  
4. **Share affordance**

Do not pack multiple competing reveals on one slide. If a beat needs setup + punchline (quiz, flip card), use two beats or a clear two-phase interaction.

### Eligibility / personalization

Wrapped drops cards when the user doesn’t qualify (Sound Town, Fan Leaderboard, clips, AI features, Music Evolution, etc.). Scrapped should likewise **omit or soft-empty** slides when gates fail — don’t invent filler that breaks the mirror.

---

## 3. Classic beat spine (all years)

These recur; Scrapped already mirrors most of them.

| # | Wrapped beat | Emotional job | Scrapped Plus mirror (export deck) |
|---|--------------|---------------|-------------------------------------|
| 0 | Brand / year open | “This is your ritual” | `00` Spotify Scrapped intro |
| 1 | **Volume** (minutes) | Scale of the year | `01` Times skipped |
| 2 | **#1 entity** (top song) | Single iconic answer | `02` Most skipped song |
| 3 | **Top 5 list** (songs) | Social comparison fuel | `03` Top skipped songs |
| 4 | **#1 artist** | Loyalty / identity | `04` Top skipped artist |
| 5 | **Top 5 artists** | Broader taste map | `05` Top skipped artists |
| 6 | Genre / podcast / extras | Texture | Optional; don’t force |
| 7 | **Personality / era / club** | Shareable identity label | Prefer arcs (`07`–`08`) over fake “types” unless data-backed |
| 8 | Creator thank-you clip | Parasocial warmth | Skip — not our product |
| 9 | **Share finale** | Portable summary | `09` ShareRecapCard |

**Smoothness rule:** Keep this spine order. Add Scrapped-only beats *between* artist lists and the finale (liked-but-scrapped, second chance, stayed-for) — not before the inverted “Wrapped classics,” or the anti-ritual won’t land.

Current export order that already follows this:

```
00 Intro
01 Volume (skips)
02 #1 song (most skipped)
03 Top songs
04 #1 artist
05 Top artists
06 Liked but scrapped          ← Scrapped-only bridge
07 Second-chance heroes        ← arc / rematch
08 Songs you stayed for        ← counterweight before share
09 Share recap
```

### Scrapped conversational spine (`/scrapped`)

Mocks in `docs/mocks/` set the voice: light solid backgrounds, no art yet, **text lands in sequence**. Same emotional spine as Wrapped (open → volume → #1 → list → artists → redemption → share), but written as short conversational lines — not industrial receipt chrome.

Mock filenames `{act}.{frame}` are **animation frames within one progress segment**, not separate slides. Title→subtitle→aside lines on one narrative block stay on **one scene** — each line is its own beat (reading-time paced); later lines accumulate without wiping the title.

```
Scene 0 (2 beats, ~8s): year / Scrapped → Hey {name} + welcome
Scene 1 (2 beats): liked library volume → liked this year + “Not bad for a collector.”
Scene 2 (3 beats): all-time favorites + ghosted punchline → “one hurt more” → #1 ghosted song
Scene 3 (2 beats): “ghost in town” setup → Top ghosted songs list
Scene 4 (3 beats): one-hit wonders → one-like artists setup → one-save artists list
Scene 5 (2 beats): “Now the artists” → #1 ghosted artist
Scene 6 (2 beats): “Get the gang back together?” → Top ghosted artists list
Scene 7 (2 beats): “Plot twist.” + setup → reunion reveal (song or setlist)
Scene 8: Share finale (holds; no auto-advance)
```

API deck plays like Stories for *in-scene* motion: progress segments fill left→right over the scene duration, then stop — the user advances. Multi-beat scenes keep one canvas; each copy line is a beat timed for reading, then the stack exits before the next narrative block. Hold/space pauses. Prev/next resets and replays the target scene.

Copy rules for this deck: one job per phase; headline then subline then optional aside; never claim true skips (affinity windows only). Soft-empty when a gate fails — keep the beat. Slide copy lives in `ApiScrappedDeck.tsx`.

---

## 4. Year themes (what to learn, not copy)

### 2023 — Identity + place

**Headline features:** genre “sandwich,” **Sound Town**, **Me in 2023** (12 flip-to-reveal characters), artist clips, Blend, short-lived DJ: Wrapped.

**Narrative lesson:** One playful identity card works when it’s a *single shareable label* after the hard stats. Interaction (flip) makes the reveal feel earned.

**Scrapped guidance:** Don’t invent Sound Towns. If we ever add a “listener label,” gate it on real skip/finish behavior and place it late (after lists), never instead of skip leaders.

**Example characters (Wrapped):** Hypnotist, Vampire, Fanatic, Time Traveler, Alchemist, …

### 2024 — Eras + AI narrators

**Headline features:** **Music Evolution** (up to 3 named phases), top-artist streak / top-listener %, NotebookLM AI podcast, AI DJ, AI Playlist, TikTok share.

**Narrative lesson:** Time is a second axis — “you weren’t one taste all year.” Phases are short titled eras with artists/genres, not a spreadsheet.

**Scrapped guidance:** `secondChanceHeroes` / `fellOff` *are* our era story — H1 reject → H2 finish (or the reverse). Keep copy in that register (“Hard no… Actually finished later”), not Wrapped’s cute phase-name generator unless we have a real descriptor pipeline.

**Example phases (Wrapped):** “Light Academia Soft Piano Classical” → “Roller Skating Pop” → “Hallyu Catwalk K-pop.”

### 2025 — Games + social

**Headline features:** **Top Song Quiz**, Listening Age, top albums, **Artist Sprint**, Fan Leaderboard, **Clubs** + roles, Listening Archive (AI day reports), **Wrapped Party**, speed/replay controls.

**Narrative lesson:** Interaction before reveal (quiz) heightens the #1 beat. Social compare is a *post-story* mode (Party), not a mid-deck interruption.

**Scrapped guidance:**

- A “guess your most-skipped” beat is on-brand *if* it stays one tap and sits immediately before `02` — don’t bury the skip leader.  
- Clubs / Party-style social is out of scope unless we build multiplayer later (AGENTS non-goals).  
- Fan Leaderboard energy maps better to “how often you abandoned this artist” than global rank cosplay.

**Example Clubs (Wrapped):** Soft Hearts Club, Grit Collective, Full Charge Crew, Cosmic Stereo Club, Club Serotonin, Cloud State Society — each with a role (Loyalist, Scout, Curator, …).

---

## 5. Narrative principles for Scrapped

Use these when writing or reordering slides.

### Do

1. **Open with brand + thesis** — product name is the hero; one line of anti-Wrapped framing.  
2. **Volume → singular → list** for songs, then the same for artists (Wrapped muscle memory).  
3. **One job per slide** — if the blurb needs “and also…”, split or cut.  
4. **Bridge before redemption** — liked-but-scrapped / second-chance come *after* the roast lists so the emotional arc is reject → complicate → forgive → share.  
5. **Counterweight before share** — “stayed for” / finishes prevent the finale from being only dunking.  
6. **Share card = portable thesis** — year + a few leaders + tagline; match Wrapped’s “screenshot the last slide” habit (`ShareRecapCard`).  
7. **Empty states that keep rhythm** — short honest line, same layout chrome; don’t delete the beat number mid-deck if we can help it.

### Don’t

1. Don’t lead with personality/club/era before the inverted classics.  
2. Don’t claim skip truth from Scrapped / Scrapped Lab (Web API) metrics.  
3. Don’t stack quiz + list + clip on one card.  
4. Don’t add Wrapped-only warmth (artist thank-you videos, Party) as hollow chrome.  
5. Don’t use play-count rankings where skip/`ms_played` logic is the product (see data rules).

### Tone

- Dry, specific, slightly merciful — not mean-spirited dunking and not fake self-help.  
- Prefer verbs of revision (*scrapped*, *stayed*, *rematch*) over Wrapped’s coronation language (*top*, *biggest fan*, *your year*).  
- When mirroring a Wrapped phrase, invert once and move on (“Wrapped’s top-song beat, inverted”) — don’t narrate the satire every slide.

---

## 6. Interaction checklist (parity without cloning)

| Pattern | Wrapped | Scrapped stance |
|---------|---------|-----------------|
| Full-bleed story | Yes | Yes (`StorySlide` / `WrappedStorySlide`) |
| Progress / index | Story bars (fill over time) | Segmented bars; active fills ~8s then waits for user |
| Ambient audio under deck | Often | Optional soundtrack tied to active slide |
| Per-slide share | Yes | Finale share card first; per-slide later only if needed |
| Hub with replay + playlists | Yes | Lab link / connect Spotify; keep hub light |
| Quiz before #1 | 2025 | Optional future beat before most-skipped |
| Multiplayer compare | 2025 Party | Non-goal for now |
| AI voiceover of your year | 2024 podcast / DJ | Non-goal for now |

---

## 7. Quick reference — year feature matrix

| Beat / feature | 2023 | 2024 | 2025 | Scrapped relevance |
|----------------|:----:|:----:|:----:|--------------------|
| Minutes listened | ✓ | ✓ | ✓ | Invert → skip volume |
| Top song / top 5 | ✓ | ✓ | ✓ | Invert → most skipped |
| Top artist / top 5 | ✓ | ✓ | ✓ | Invert → skip-weighted artists |
| Genres | sandwich | via Evolution | ✓ return | Low priority |
| Identity label | Me in 2023 | — | Clubs | Only if data-backed, late |
| Place / social graph | Sound Town | — | Party | Out of scope |
| Time arcs | peak months | Music Evolution | Artist Sprint | Second chance / fell off |
| Interactive reveal | flip card | — | Top Song Quiz | Optional before #1 skip |
| AI narration | DJ: Wrapped | AI Podcast / DJ | Listening Archive | Out of scope |
| Share finale | ✓ | ✓ | ✓ | Keep |

---

## 8. Sources & caveats

Synthesized from Spotify Newsroom (Wrapped UX 2023–2025, Me in 2023, Music Evolution, Clubs, How Wrapped is made) plus contemporary walkthroughs (Business Insider, HowToGeek, Gizbot, Mashable, Xataka, etc.).

- Card **order is personalized**; tables above are the *typical eligible-user spine*, not a guarantee.  
- Data windows end mid/late November; Private Mode / taste exclusions affect taste stories vs totals.  
- When Wrapped and this doc disagree with live app behavior, trust the app and update this file.

---

## 9. Related repo docs

| Doc | Role |
|-----|------|
| [AGENTS.md](../AGENTS.md) | Product intent, stack, non-goals |
| [DATA.md](DATA.md) | Export schema, skip heuristics |
| [SPOTIFY_API.md](SPOTIFY_API.md) | OAuth + Scrapped / Lab limits |
| `.cursor/rules/spotify-data.mdc` | Always-on data invariants |
| `.cursor/skills/scrapped-art-direction/` | Visual system for story decks (anti AI-slop) |

When changing Scrapped Plus (export deck), also skim `src/components/scrapped/ScrappedDeck.tsx` and `DeckSoundtrack.tsx` so audio grouping still matches narrative acts.
