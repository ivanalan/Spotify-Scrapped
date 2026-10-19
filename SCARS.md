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
- **Avoid:** On list beats, elevate BeatBody above tap zones (`z-[35]`) with `pointer-events-none`, and only re-enable `pointer-events-auto` on the list scrollport so title/empty areas still pass taps through.
- **Related:** `WrappedStorySlide.tsx`, `ApiScrappedDeck.tsx` tap zones

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
