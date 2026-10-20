# SCARS.md

What has already hurt us. **Title each entry with the symptom** (reporter’s words).  
Read before diagnosing. Append-only — never delete; supersede with a newer scar if needed.

Format:

```markdown
## <Symptom in the reporter’s words>
- **Not:** …
- **Cause:** …
- **Proof:** …
- **Avoid:** …
- **Related:** D-NNN / links (optional)
```

---

## Chat bubbles jump when the left-on-read list enters

- **Not:** List layout reflow, MotifStage crop, or another remount of `LeftOnReadChatChrome`.
- **Cause:** `quiet` and `frame` used different column scale / `top` / `left` (and mirror size). Setup looked larger and more inboard; list beat snapped to the edge frame.
- **Proof:** “Get the gang back together?” bubbles sat mid-left; “Top artists you left on read” had the same pills smaller and hard against the edges.
- **Avoid:** Quiet and frame share edge geometry **and** opacity — no second layout, no fade-up on list enter. (Supersedes earlier “quiet only lowers opacity.”)
- **Related:** [D-015](docs/decisions/D-015-list-art-frames-not-heroes.md), `middeck-metaphors.css`

## Left-on-read chats start dimmer than on the list

- **Not:** Stagger enter mid-flight, or a remount of `LeftOnReadChatChrome`.
- **Cause:** After geometry was unified, `quiet` still used column `opacity: 0.55` / mirror `0.28` vs frame `0.8` / `0.38`, so setup→list brightened the pills.
- **Proof:** Bubbles on “Get the gang back together?” read softer than the same edge stack under “Top artists left on read.”
- **Avoid:** Quiet and frame use the same column/mirror opacity (frame values). Mode flip is semantic only.
- **Related:** scar above, `middeck-metaphors.css`

## “Get the gang back together” slide starts twice

- **Not:** Copy `visitKey` / `BeatBody` remounting, or the list cascade playing early.
- **Cause:** Scene 6 chat chrome used `beatPhase >= 1` for quiet→frame, so the edge bubbles remounted when the setup *subline* landed. `LeftOnReadChatChrome` keyed on `visualMode`, which re-ran `mm-skew-slide` enter.
- **Proof:** Bubbles slid in on “Get the gang back together?”, then slid in again as “They’ll take you back.” appeared — before the list beat.
- **Avoid:** Frame mode only when the list narrative starts (`beatPhase >= 2` for this scene’s 2-line setup). Key chat chrome on `replayKey` only; flip `data-mode` for quiet→frame. Quiet/frame must share edge geometry (see scar above).
- **Related:** [D-016](docs/decisions/D-016-middeck-metaphor-promote.md), [D-017](docs/decisions/D-017-entity-list-pair-rhymes.md), `LeftOnReadChatChrome.tsx`, `ScrappedOrbitArt.tsx`

## Left-aligned setup copy jumps to center before fading into a centered cover beat

- **Not:** Framer layout spring, wrong `align` on the setup beat, or the cover beat’s own centering.
- **Cause:** `WrappedStorySlide` applied `text-center` on the **section** from `current.align`. When the scene advanced left→center (e.g. “One of them stings most” → “Most ghosted song”), the section flipped immediately while `AnimatePresence` was still exiting the old `BeatBody`, so outgoing copy inherited center mid-fade. Same class of leak as section-level justify yanking setup copy ([Title jumps…](#title-jumps-or-stays-put-when-the-subtitle-appears-on-list-setup-slides)).
- **Proof:** “One of them stings most” slid to center, then faded; only the cover beat should be centered. Same risk on left→center artist reveal and any mixed-align scene.
- **Avoid:** Never put beat `align` / `text-center` on the slide section. Own `text-left` / `text-center` on `BeatBody` from that beat’s `align` so exits keep their alignment.
- **Related:** `WrappedStorySlide.tsx`, single-cover beats in `ApiScrappedDeck.tsx`

## Invisible API player still blocks the list on mobile

- **Not:** List `bottom-24` padding alone, or `showPlayer={false}` failing to hide chrome.
- **Cause:** `DeckSoundtrack` kept the warm embed shell in the fixed bottom stage at `h-20` with `opacity-[0.01]` so iOS would buffer. Nearly invisible, but still painted over the list / bottom of the slide.
- **Proof:** Ghosted-songs list on `/scrapped` showed empty/smudged space above the browser chrome where the Spotify embed sat; API deck passes `showPlayer={false}`.
- **Avoid:** When the player is not on stage, park the pool shell out of flex flow and off-viewport (`absolute` + large negative translate). Keep a real painted size/opacity for buffering — do not leave a near-invisible `h-20` on the content stage.
- **Related:** `DeckSoundtrack.tsx`, `ScrappedExperience.tsx`

## Numbered entity list is not scrollable on the live deck

- **Not:** Missing `overflow-y-auto` on the list wrapper, or covers/gaps alone causing the clip.
- **Cause:** List region used `z-[35]` inside BeatBody’s `z-10` stacking context, while Stories tap zones sit at `z-30` on the deck root — so every vertical pan hit prev/next instead of the scrollport. Horizontal scroller also uses `overflow-y-hidden`, so clipped rows had nowhere to go.
- **Proof:** Ghosted songs list cut off the 5th row; swipe on the list did not scroll. Labs scrolled because they have no overlay tap zones.
- **Avoid:** Superseded for live-deck tap priority — see [Cannot tap to advance on list content](#cannot-tap-to-advance-on-list-content). Labs still use list `pointer-events-auto` + overflow scroll without overlay zones.
- **Related:** `WrappedStorySlide.tsx`, `ApiScrappedDeck.tsx` tap zones

## Cannot tap to advance on list content

- **Not:** Missing `onClick` on list rows, or pause/hold eating the gesture.
- **Cause:** List BeatBody was raised to `z-[35]` with scrollport `pointer-events-auto` so pans could scroll above Stories tap zones at `z-30` — so taps on rows never reached prev/next.
- **Proof:** On ghosted songs / artist list beats, tapping a row did nothing; tapping empty chrome still advanced.
- **Avoid:** Keep live-deck tap zones above the list (`z-[36]`), under chrome (`z-40`). Do not put the list scrollport above tap zones on `/scrapped`. Accept that row-area touch-scroll loses to Stories tap-to-advance on the live deck; labs without overlay zones still scroll.
- **Related:** `ApiScrappedDeck.tsx` tap zones, `WrappedStorySlide.tsx` pinTop list beat

## Title jumps (or stays put) when the subtitle appears on list setup slides

- **Not:** The soundtrack, the slide copy wording, or cascade row timing alone. Not “the list beat’s title at the top.”
- **Cause:** Several wrong guesses stacked: (1) turning off Framer `layout` on setup/list copy so the title no longer eases up when the subtitle mounts; (2) putting the layout spring on the default `transition` so subtitle **enter** felt rough; (3) faking mid-slide position with `justify-center` + `min-h` flex centering, which **recenters instantly** when the subtitle mounts; (4) top-pinning the whole **scene** (`justify-start`) so setup copy yanked on handoff; (5) inventing setup-only exits (`fadeOnly` / `riseOut`) and padding offsets instead of the shared copy pattern.
- **Proof:** “But this wasn’t the only ghost in town” either teleported when “Call the ghostbusters…” landed or never moved up; lab cascade looked right while the live deck felt wrong; user confirmed the desired pattern is the **same as every other slide** for setup copy.
- **Avoid:** Special-casing setup copy before a list. Top-pinning entire scenes. Disabling layout on copy. Attaching layout spring as the enter transition. Use shared `softEnter` + `{ layout: layoutSpring }` only; only the numbered list beat uses `pinTop`.
- **Related:** [D-001](docs/decisions/D-001-story-copy-vs-list-motion.md)

## List rows all appear at once (no cascade) on the live deck

- **Not:** Missing data or empty `WrappedEntityList` items.
- **Cause:** List mounted in the same phase as the subtitle (`showSupport` tied to copy lines), and rows used `initial={false}` while already `active`, so Framer skipped enter-from-initial.
- **Proof:** Lab remounted inactive→active and showed cascade; live slide 04 felt like subtitle + all five rows together.
- **Avoid:** Mount the list in a separate `hasSupport` phase after copy. Plan row motion with real `initial` values when active so stagger plays on mount.
- **Related:** [D-001](docs/decisions/D-001-story-copy-vs-list-motion.md)

## Sign-out modal has no background (transparent panel, white text)

- **Not:** Missing overlay / AlertDialog broken / forgot `bg-*` class.
- **Cause:** Dialog content is portaled outside `.wrapped-story`. Classes using `--wrapped-canvas` / `--wrapped-ink` resolve to nothing → transparent fill; title inherits light theme foreground.
- **Proof:** Panel showed page through a thin ring; title/body were white on gray; fixed by restoring `#f4f4f2` / `#1c1c1c` hex on dialog chrome.
- **Avoid:** On portaled UI (AlertDialog, etc.), do not rely on `--wrapped-*`. Use literal paper hex or tokens that exist on `:root`.
- **Related:** [D-003](docs/decisions/D-003-shadcn-standard-controls.md)

## Gate Sign out button disappears when the confirm modal opens

- **Not:** Unmount on click, logout firing early, or the trigger being removed from the DOM.
- **Cause:** Outline `Button` styles include `aria-expanded:text-foreground` (near-white on the app’s dark theme) while `dark:bg-input/30` keeps a near-transparent fill. Opening the AlertDialog sets `aria-expanded` on the trigger → white ink on paper → label vanishes; modal still shows.
- **Proof:** Computed style after open was light foreground + transparent bg; forcing `aria-expanded` / `dark:` paper hex with `!` kept `rgb(28,28,28)`.
- **Avoid:** On paper surfaces, override outline/default `aria-expanded` and `dark:` color utilities with `!` hex (same class of leak as the transparent modal scar).
- **Related:** [D-003](docs/decisions/D-003-shadcn-standard-controls.md), `SignOutConfirmButton.tsx`

## “No all time favs got ghosted” then Most ghosted song with art

- **Not:** Mobile-only layout, soundtrack fallback, or missing Spotify tops.
- **Cause:** `slimForCookie` wiped headline `detail` (`"N of M"`) to save header bytes while keeping `left-long-run` items + art. Deck copy parsed only `detail` → null → empty headline; next beat still read `items[0]`.
- **Proof:** Production (cookie-only on Vercel) showed empty copy then Dapper cover; local FS snapshots kept detail and looked fine.
- **Avoid:** Keep headline `detail` in cookie slim. Resolve ghosted count via `leftLongGhostedCount` (detail → percent×long → items), never claim zero when the list still has songs.

## Load data gate does not auto-start on mobile

- **Not:** Missing `autoStart` prop, iOS blocking `requestSubmit`, or the user needing to tap once for a gesture.
- **Cause:** Auto-start wrote `sessionStorage["scrapped-lab-autostart"]=1` *before* the POST navigated. A cancelled first attempt (Strict Mode remount, refresh mid-load, Safari restore) left the latch set; later mounts returned early and never submitted. The key was only cleared after a successful ready deck.
- **Proof:** Mobile showed the idle “Load data” button after sign-in / revisit in the same tab; desktop often “worked” because people tapped. Cleared only in `ScrappedExperience`.
- **Avoid:** Do not latch auto-start in `sessionStorage` before navigation succeeds. Defer submit with a timeout and cancel it on effect cleanup so Strict Mode remounts get one real submit.

## Soft-close bottom pill stack missing on mobile, visible on web

- **Not:** Missing bottom art in the double-stack markup, or a mobile-only CSS `display:none`.
- **Cause (1):** Phone soft close used full-frame `MotifStage` (`xMidYMid slice`) with `FunkyDoubleStack`. Tall portrait viewports cover-scale the 360×640 design space and crop top/bottom equally — the mirrored bottom bookend sits near the viewBox floor and disappears. Wide path already pinned stacks to `top-center` / `bottom-center`.
- **Cause (2, after pins):** Bottom bookend still flaky on deployed iOS — SVG `translate+scale(1,-1)` nested inside Framer `motion.g` (opacity enter) often failed to paint under WebKit. Top (unmirrored) was fine.
- **Proof:** Phone Safari showed only the top bookend on slide 8; desktop wide (and fixed-frame mocks) showed both.
- **Avoid:** Edge-anchored bookends must use Motif pins on every viewport. Mirror the bottom pin with CSS `scaleY(-1)` on the pin box, same unmirrored `FunkyPillStack` as top; don’t animate opacity on close enter.
- **Related:** [D-009](docs/decisions/D-009-responsive-motif-pins.md), `CloseBookendChrome` in `ScrappedOrbitArt.tsx`

## Share button does nothing on iOS Safari

- **Not:** Tap zones eating the Share hit target, or missing `navigator.share` support entirely.
- **Cause:** (1) Capture (`domToBlob`) ran inside the click before `navigator.share`, so WebKit dropped the user-gesture token. (2) `ShareData` included `title`/`text` with `files` — WebKit `canShare`/`share` rejects that combo.
- **Proof:** Share no-op on iPhone Safari; desktop download fallback still worked.
- **Avoid:** Pre-capture the PNG while the finale is idle; on tap share **files-only** with the warmed blob. Gate the button on precapture ready.

## Hold to pause temporarily is broken / fights taps

- **Not:** Sticky pause button or spacebar failing on their own.
- **Cause:** Stories-style press-hold on left/right tap zones (`HOLD_PAUSE_MS` + `pressHeld`) shared the same gesture path as prev/next, so short presses and holds competed (timer, pointer capture, soundtrack prime cancel).
- **Proof:** Hold pause felt unreliable; users wanted pause only via the chrome button.
- **Avoid:** Do not reintroduce zone press-hold pause. Pause is sticky button / space (and media-key API) only; zones tap to navigate.

## Desktop #1 artist slide looks like a mobile-cropped background

- **Not:** `ProductMain` max-width, missing `w-screen`, or the slide canvas failing to paint edge-to-edge.
- **Cause:** Wide `entity-artist` used `MotifMeetStage` with `preserveAspectRatio="xMidYMid meet"`. That letterboxes the 9:16 design into the landscape slide — solid ink still filled the viewport, but the orbit read as a phone-sized frame with empty side flanks.
- **Proof:** “Artists you left on read” on desktop showed a centered portrait oval stack with flat ink gutters L/R.
- **Avoid:** On wide, cover-scale the artist orbit (`slice`), not `meet`. Keep `meet` only where showing the whole motif matters more than filling (e.g. song spiral arms).
- **Related:** [D-009](docs/decisions/D-009-responsive-motif-pins.md), `ScrappedOrbitArt` WideOrbitChrome

## 1-like heart vanishes too early / list hearts pop in too fast

- **Not:** Story autoplay advancing before the setup beat finishes, or copy motion stealing the handoff.
- **Cause:** (1) `OneLikeHeartChrome` hard-swapped `mode` hero→frame (unmount hero / mount floaters). Floater CSS used **negative** `animation-delay`s. (2) Even with a crossfade, art followed `beatIndex` instantly — hero fade started while setup copy was still exiting.
- **Proof:** Advancing “Meet your 1 like artists” → “1 like artists” list: big heart cut out / started leaving before the list title landed; edge hearts already halfway up.
- **Avoid:** Keep hero + frame mounted under one `mm-heart-scene`. Delay visual `frame` until copy exit + list title enter settle (`LIST_HANDOFF_HOLD_MS`). List floaters use positive stagger delays and a slow opacity hold at the bottom of the rise.
- **Related:** [D-016](docs/decisions/D-016-middeck-metaphor-promote.md), `OneLikeHeartChrome.tsx`, `middeck-metaphors.css`

## MyScrapped.com clipped by the share moon

- **Not:** Missing footer copy, wrong brand string, or stage disks bleeding onto the card.
- **Cause:** Share finale moon/ghosts used `z-[2]` while hero / lists / footer sat at `z-[1]`, so the BL sphere painted over type.
- **Proof:** Warm gold→rose oval covered part of `MyScrapped.com` and list rows on the teal card.
- **Avoid:** Keep moon/ghosts under type (`z-0` art, `z-[2]` content). Ghosts still read through the transparent hero band.
- **Related:** [D-014](docs/decisions/D-014-share-finale-kit-j8.md), `ShareRecapCard`

## Non-allowlisted Spotify sign-in refreshes with a JSON parse error

- **Not:** Session cookie loops, lab-refresh autoStart, or quota cooldown refresh.
- **Cause:** Dev Mode rejects users not on the Dashboard allowlist; Spotify’s token endpoint often returns **plain text** (`The user is not registered…`). `tokenRequest` called `response.json()`, threw `Unexpected token 'T'…`, and callback stuffed that into `?spotify_error=`. The home page never read the query param, so the gate still showed **Sign in**; with `show_dialog: false` each click bounced Spotify → error URL again.
- **Proof:** `myscrapped.com/?spotify_error=Unexpected+token+%27T%27…` for accounts not among the 5 Dev Mode users.
- **Avoid:** Parse token bodies as text first; map allowlist failures to `not_allowlisted`; redirect only stable codes; surface `spotify_error` on `ScrappedGate` as calm copy.
- **Related:** [docs/SPOTIFY_API.md](docs/SPOTIFY_API.md), `src/lib/spotify/oauth.ts`, `src/app/api/spotify/callback/route.ts`

## Grass grows from the horizontal centerline / scales both directions

- **Not:** Wrong MotifPin anchor, flipped viewBox, or missing cascade delays.
- **Cause:** Motion `scaleY` on SVG `<g>` pivots from the group mid-box. CSS `transform-origin` / `transformBox: fill-box` and translate→scale→translate wrappers did not change the perceived origin.
- **Proof:** Ghosted entity ridge grass expanded up **and** down from a mid band instead of emerging from the soil line.
- **Avoid:** Do not use `scaleY` for grass grow-in. Rise each ridge from below a ground `clipPath` (`y: rise → 0`), cascade near→mid→far.
- **Related:** [D-021](docs/decisions/D-021-ghosted-grass-rise-from-soil.md), `SpikyGrass` in `PeripheralMotifs.tsx`
