# Scrapped API story script (`/scrapped`)

**Purpose:** Editable copy brief for the API Scrapped deck. Edit text here; ask an agent to sync into [`src/components/scrapped/ApiScrappedDeck.tsx`](../src/components/scrapped/ApiScrappedDeck.tsx). This file is **not** imported at runtime.

**Spine & rules:** [WRAPPED.md](WRAPPED.md) (beat order, affinity-only language). Never claim true skips.

**Fields** map to `WrappedStorySlide`: `headline`, `subline`, `aside`, `footer`, plus `tone` / `display` notes. Placeholders (`{profileName}`, `{likedCount}`, …) stay as JS interpolation in code.

**Italics** in product: wrap with `_like this_` → `<span className="italic">` in React.

---

## Helpers

### `likedAside({likedCount})` — scene 1 beat A subline

| When | Copy |
|------|------|
| `<= 0` | Empty shelves. Bold. |
| `< 80` | A short shelf. High standards — or just getting started. |
| `< 250` | A solid pile of “I’ll listen later.” |
| `< 600` | That’s a lot of almosts waiting in the wings. |
| else | A whole museum of maybe. |

---

## Scene 0 — year open + thesis (paired)

- tone: paper
- notes: Copy enter delayed for Continue audio. No blur-in. ~8s paired; both beats stay center-aligned.

### Beat A — year open

- headline (named): `{profileName}’s {year} _Scrapped_`
- headline (anonymous): `{year}`
- subline (named): _(none)_
- subline (anonymous): `_scrapped_`
- display: hero (named) / year (anonymous)
- align: center

### Beat B — thesis

- headline: Scrapped is your _anti-wrapped_.
- subline: What artists you ghosted, and which of your songs fell off. Ready?
- footer: Created by Alan Matias
- display: hero
- align: center

---

## Scene 1 — library volume + tops bridge (paired)

- tone: sand
- notes: ~8s paired. Affinity / library only — not skips.

### Beat A — liked volume

- headline: `{likedCount} liked songs in your library.`
- subline: → `likedAside({likedCount})`
- display: hero

### Beat B — tops bridge

- headline (has tops): `and {longCount} all-time top songs`
- headline (no tops): and your all-time top songs
- subline: But how did they hold up this year?
- display: hero

---

## Scene 2 — ghost rate + #1 ghosted song (paired)

- tone: blush
- notes: ~8s paired. “Ghosted” = missing from recent tops, not true skips.

### Beat A — ghost rate

- headline: `{ghostPercent}% of your all-time top favorites were ghosted.`
- subline: Which fell off the hardest?
- footer: `{leftLongHeadline.detail}` (metric card detail when present)
- display: hero

#### Empty (no multi-year list / `ghostPercent` null)

- headline: Your all-time favorites didn’t show up.
- subline: Spotify didn’t return a multi-year list this time.

### Beat B — #1 ghosted song

- headline: `{topSong.label}`
- subline: Your highest multi-year favorite that isn’t in the 6-month or 4-week tops.
- aside: Why not give them another chance?
- footer: `{topSong.sublabel} · {topSong.detail}`
- lead: album art when `topSong` present
- display: hero

#### Empty (no top song)

- headline: Nobody to call out.
- subline: Wow — you actually still talk to your old favorites.
- aside: _(none)_

---

## Scene 3 — list setup

- tone: sky
- display: hero
- headline: Bring back the group
- subline: Here are your top 5 favorite songs that didn’t make it this year.
- notes: Bridge before the list; one job only.

---

## Scene 4 — top ghosted songs

- tone: paper
- display: sentence
- headline: Left on read
- subline: Multi-year favorites missing from both recent windows.
- content: `WrappedEntityList` of left-long songs
- notes: Soft-empty via list empty UI if no items.

---

## Scene 5 — artist act bridge

- tone: cream
- display: hero
- headline: Now the artists.
- subline: Same energy — people you used to keep on repeat, then quietly stopped texting.
- notes: Bridge into artist act; one job only.

---

## Scene 6 — #1 ghosted artist

- tone: sand
- display: hero
- headline: `{topArtist.label}`
- subline: Your highest multi-year artist who isn’t in the 6-month or 4-week tops.
- aside: They’re fine. They’re just busy not being pressed by you.
- footer: `{topArtist.detail}`

#### Empty (no top artist)

- headline: No missing persons.
- subline: Your loyalty program is weirdly intact.
- aside: _(none)_

---

## Scene 7 — top ghosted artists

- tone: mist
- display: sentence
- headline: On sabbatical (from you)
- subline: Multi-year top artists who slipped out of both recent windows.
- content: `WrappedEntityList` of left-long artists
- empty: Empty sabbatical list. Touch grass? Or don’t.

---

## Scene 8 — reunion setup

- tone: blush
- display: hero
- headline: Plot twist.
- subline: Not everyone stayed ghosted. A few old favorites slid back into your last four weeks.
- notes: Bridge into reunion; one job only.

---

## Scene 9 — reunion reveal

- tone: sage
- notes: Branch — setlist when `secondChance.items.length > 1`, else single song / empty.

### Variant A — setlist (2+ reunions)

- display: sentence
- headline: The reunion setlist
- subline: Old multi-year favorites — or old likes — back in your 4-week tops after a gap.
- footer (optional): `{artistsBackCount} artists also came back this month`
- content: `WrappedEntityList` of second-chance songs (top 5)

### Variant B — single reunion song

- display: hero
- headline: `{reunionSong.label}`
- subline: An old multi-year favorite — or an old like — that’s back in your 4-week tops after a gap.
- aside: We don’t have to talk about it.
- footer: `{reunionSong.sublabel} · {reunionSong.detail}`

#### Empty (no reunion song)

- headline: No reunions on the calendar.
- subline: The soft launch stayed soft. For now.
- aside: _(none)_
- footer (optional): `{artistsBackCount} artists also came back this month` when artists came back but no song

---

## Scene 10 — share finale

- tone: slate
- notes: Holds; no auto-advance. `ShareRecapCard` — labels below; entity data from report.
- leftLabel: On sabbatical
- rightLabel: Left on read
- hero: top ghosted artist art, else top ghosted song art
- skipped column: left-long artists (top 5)
- stayed column: left-long songs (top 5)

---

## How to apply

1. Edit copy in this file.
2. Ask an agent to update the API stories from `docs/STORY_SCRIPT.md`.
3. Agent patches `ApiScrappedDeck.tsx` (and `likedAside` if buckets changed) to match — keep placeholders as existing JS.
)
