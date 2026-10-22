# Official Wrapped motion capture (2024)

**Source video (local, not in git):** `~/Downloads/Spotify Wrapped 2024.mp4`  
(~252s, 358×640 portrait, H.264 @ 30fps; screen capture of Spotify Wrapped **2024** with player chrome overlaid.)

**Purpose:** Beat spine + motion grammar reference for Scrapped; especially **Music Evolution** eras and the AI podcast beat. Invert meaning; do **not** clone neon ribbons, pixel frames, or purple/coral carnival looks. Narrative rules: [docs/WRAPPED.md](../../WRAPPED.md) §4 (2024) + §10.

Sibling pack (2023 hub / Sound Town / Me-in-2023): [../wrapped-ref/](../wrapped-ref/).

## Folders

| Path | What’s in it |
|------|----------------|
| `named/` | Preferred agent index; one frame per major beat (`00-loading` … `25-share-finale`) |
| `beats/` | Same capture sampled every 8s (`t000.png` = 0s, `t080.png` ≈ 80s, …) |
| `scenes/` | ffmpeg scene-cut stills + `ffmpeg.log` (`pts_time:` cut list; threshold 0.12) |

## Named beat index (this capture)

| File | ~t | Wrapped job |
|------|----|-------------|
| `00-loading` | 0s | Green spinner → story |
| `01-brand-open` | 4s | Logo + ribbon art open |
| `02-hello` | 12s | Personalized greeting |
| `03-life-setup` | 20s | “Life moves fast” thesis |
| `04-volume-minutes` | 28s | Minutes listened + top-% |
| `05-biggest-day` | 36s | Peak listening day |
| `06-art-transition` | 40s | Full-bleed art morph between cards |
| `07-volume-songs` | 44s | Song-count volume |
| `08-top-song` / `09-top-song-detail` | 56-64s | #1 song → streams / start date |
| `10-list-bridge` | 76s | Bridge before list (“not a competition…”) |
| `11-top-songs-list` | 80s | Top 5 songs (numbered + covers) |
| `12-evolution-bridge` | 94s | Music Evolution setup |
| `13-evolution-era-1` | 108s | Era 1 (July; named phase + artists) |
| `14-evolution-era-2` | 128s | Era 2 (August) |
| `15-evolution-era-3` | 144s | Era 3 (September) |
| `16-artists-setup` | 152s | Artist-count setup |
| `17-top-artist` / `18-top-artist-detail` | 160-168s | #1 artist → top-% fan + minutes |
| `19-artist-clip` | 176s | Creator thank-you / clip (omit in Scrapped) |
| `20-artists-bridge` | 184s | Bridge before artists list |
| `21-top-artists-list` | 192s | Top 5 artists list |
| `22-podcast-setup` → `23-ai-podcast` | 200-216s | AI podcast / “company” beat (omit in Scrapped) |
| `24-thanks-close` | 240s | Closing thank-you |
| `25-share-finale` | 248s | Collage + Share + Replay |

Rough spine (wall-clock):

```
0-20s    Load → brand → hello → life setup
28-44s   Minutes → biggest day → art → song count
56-80s   #1 song → detail → list bridge → top 5 songs
94-144s  Music Evolution (bridge → 3 named eras)
152-192s Artist volume → #1 → detail → clip → top 5
200-232s AI podcast
240-252s Thanks → share finale + replay
```

## Re-extract

```bash
SRC=~/Downloads/Spotify\ Wrapped\ 2024.mp4
OUT=docs/mocks/wrapped-ref-2024
ffmpeg -y -ss 80 -i "$SRC" -frames:v 1 -q:v 2 "$OUT/beats/t080.png"
```

Prefer updating `named/` when picking a clearer still; keep timestamps in the table so pacing stays measurable.
