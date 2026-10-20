# Spotify Web API integration

OAuth for **Scrapped**, **Scrapped Lab**, and Liked-Songs enrichment on **Scrapped Plus**.

Uses a small custom OAuth flow (not Auth.js) so the redirect URI is identical on authorize and token exchange — required by Spotify.

## Setup

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add redirect URI (**exact** — Spotify rejects `localhost`):

   ```
   http://127.0.0.1:3000/api/spotify/callback
   ```

   Remove any older `/api/auth/callback/spotify` or `localhost` URIs.

3. Copy Client ID / Secret into `.env.local` (see `.env.example`):

   ```bash
   AUTH_SECRET=          # openssl rand -base64 32
   AUTH_SPOTIFY_ID=
   AUTH_SPOTIFY_SECRET=
   AUTH_URL=http://127.0.0.1:3000
   ```

4. Run `npm run dev`, open [http://127.0.0.1:3000](http://127.0.0.1:3000), click **Sign in to Spotify**.

Confirm the URI with `GET /api/spotify/debug-auth`.

## What’s in the repo

| Piece | Path |
|-------|------|
| OAuth authorize / token | [`src/lib/spotify/oauth.ts`](../src/lib/spotify/oauth.ts) |
| Encrypted session cookie | [`src/lib/spotify/session.ts`](../src/lib/spotify/session.ts) |
| API helpers | [`src/lib/spotify/client.ts`](../src/lib/spotify/client.ts) |
| Tops / recent / liked / playlists | [`src/lib/spotify/listening.ts`](../src/lib/spotify/listening.ts) |
| Routes | `/api/spotify/login`, `/callback`, `/logout`, `/me` |
| Scrapped (API deck) | `/scrapped` → [`src/lib/load-scrapped-api-lab.ts`](../src/lib/load-scrapped-api-lab.ts) |
| Scrapped Lab | `/scrapped/lab` → same loader |

### Using the client (server-only)

```ts
import {
  getSpotifyProfile,
  getTopTracks,
  getRecentlyPlayed,
  getSavedTracksDetailed,
  spotifyFetch,
} from "@/lib/spotify";

const profile = await getSpotifyProfile();
const short = await getTopTracks("short_term");
const recent = await getRecentlyPlayed();
const { tracks: liked, total: likedTotal } = await getSavedTracksDetailed();
```

## Scopes

See `SPOTIFY_SCOPES` in [`src/lib/spotify/scopes.ts`](../src/lib/spotify/scopes.ts). Reconnect after changing scopes.

## Limits (Scrapped / Scrapped Lab)

- `recently-played`: ~50 completed plays total; skips are not returned.
- `top/tracks` & `top/artists`: affinity ranks for short / medium / long windows — not calendar-year play counts.
- Liked Songs: paginated fetch (up to ~10k) so liked-this-year / one-save metrics see the full library, not a ~200-track sample.
- True skip / `ms_played` analytics still require the Extended Streaming History export (`/scrapped/plus`).

## Caveats

- Prefer `GET /tracks/{id}` over batch endpoints (restricted on many new apps).
- Never commit `.env.local` or tokens.
- **Development mode allowlist:** Spotify caps Dev Mode apps at **5** Dashboard users ([quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)). Non-allowlisted accounts can still complete the Spotify login screen; token exchange or `/me` then fails. Callback maps that to `?spotify_error=not_allowlisted` and the home gate shows a calm beta message — it does not dump JSON-parse noise into the URL or auto-retry OAuth.
