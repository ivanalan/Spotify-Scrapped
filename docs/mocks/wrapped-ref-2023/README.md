# Official Wrapped motion capture (2023)

**Source video (local, not in git):** `~/Downloads/My-Spotify-Wrapped-SnapYT.App.mp4`  
(~271s, 288×640 portrait, H.264 @ 29fps; SnapYT screen capture of Spotify Wrapped **2023** with player chrome overlaid.)

**Purpose:** Beat spine + motion grammar reference for Scrapped. Invert meaning; do **not** clone neon art, ribbons, or purple/coral carnival looks. Narrative rules: [docs/WRAPPED.md](../../WRAPPED.md) §10.

Sibling pack (**2024** Music Evolution / AI podcast): [../wrapped-ref-2024/](../wrapped-ref-2024/).

## Folders

| Path | What’s in it |
|------|----------------|
| `named/` | Preferred agent index; one frame per major beat (`00-hub` … `25-share-finale`) |
| `beats/` | Same capture sampled by wall-clock (`t000.png` = 0s, `t080.png` ≈ 80s, …) |
| `scenes/` | ffmpeg scene-cut stills + `ffmpeg.log` (`pts_time:` cut list) |

## Named beat index (this capture)

| File | ~t | Wrapped job |
|------|----|-------------|
| `00-hub` | 0s | Wrapped hub grid before story |
| `01-loading` | 3s | Green spinner → story |
| `02-brand-open` | 6s | Year / brand open with looping art |
| `03-hello` | 10s | Personalized greeting |
| `04-feast-setup` / `05-genres-reveal` | 18-22s | Setup line → genre count reveal |
| `06-art-transition` | 28s | Full-bleed art morph between cards |
| `07-sound-town` | 48s | Place / “listened like you” map |
| `08-volume-songs` | 56s | Song-count volume |
| `09-top-song` | 64s | #1 song + plays + Share CTA |
| `10-list-bridge` | 72s | Bridge copy before list |
| `11-top-songs-list` | 80s | Top 5 songs (numbered + covers) |
| `12-playlist-cta` | 88s | Top Songs playlist / library CTA |
| `13-time-setup` / `14-volume-minutes` | 96-104s | Minutes volume + “days nonstop” |
| `15-artist-setup` / `16-top-artist` | 112-120s | #1 artist + top-% + minutes |
| `17-artists-bridge` / `18-artist-rank-detail` | 130-140s | Ranked artist cards + peak month |
| `19-top-artists-list` | 180s | Top 5 artists list |
| `20-artist-clip` | 190s | Creator thank-you video (omit in Scrapped) |
| `21-podcast` | 220s | Podcast / extras beat |
| `22-personality-setup` → `24-me-in-2023` | 230-250s | Tap-to-reveal identity (“Time Traveler”) |
| `25-share-finale` | 260s | Collage + Share + Replay |

## Re-extract

```bash
SRC=~/Downloads/My-Spotify-Wrapped-SnapYT.App.mp4
OUT=docs/mocks/wrapped-ref
ffmpeg -y -ss 64 -i "$SRC" -frames:v 1 -q:v 2 "$OUT/beats/t064.png"
```

Prefer updating `named/` when the source year changes; keep timestamps in filenames or a table so pacing stays measurable.
