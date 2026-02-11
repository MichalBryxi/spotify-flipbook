# Spotify Flipbook

![Spotify Flipbook preview](docs/preview.png)

Spotify Flipbook is an [Ember app](https://emberjs.com) that runs entirely in the browser and turns Spotify tracks or playlists into printable cards. It uses third-party Spotify endpoints to resolve track metadata and generate Spotify scannable codes.
Each card contains:

- Album artwork
- Track title
- Artist name(s)
- Custom message
- Spotify scannable code (SVG)

## Why this is useful

Spotify links are not great for physical gifts, event tables, or scrapbook-style memories.
This project gives you a fast way to convert tracks into something tangible you can print, cut,
share, and scan later with Spotify.

Common uses:

- Party or wedding music cards
- Memory books with songs tied to moments
- Classroom, workshop, or event handouts
- Gift inserts with personalized messages

## Privacy and Project Promise

- No tracking
- No analytics
- No ads
- No data monetization
- No paywall now or in the future
- No premium paid-only features now or in the future

This project is for everyone and intended to remain free forever.

## Requirements

- Node.js 20+
- pnpm

## Install

```bash
pnpm install
```

## Run locally

```bash
pnpm start
```

Open `http://localhost:4200`.
Live app: `https://spotify-flipbook.netlify.app`.

## How to use it

1. Paste one line per Spotify track or playlist in the left editor using this format:

```text
spotifyTrackOrPlaylistUrl,custom message
```

2. Examples:

```text
https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC,This one reminds me of our hike in Lauterbrunnen
https://open.spotify.com/playlist/2SNR0Fi1oxGMcM740jamt4,For our roadtrip
```

3. Click `Generate`.
4. Review the preview pages on the right.
5. Click `Print` to open your browser print dialog.

The print layout is optimized for A4 output and hides editor controls so only the cards are printed.

## What happens under the hood

- Track metadata is resolved client-side through Spotify Web API when
  `SPOTIFY_ACCESS_TOKEN` is present at build time.
- Playlist URLs require `SPOTIFY_ACCESS_TOKEN` because Spotify `oEmbed` cannot
  return playlist track lists.
- If no access token is configured or the API request fails, metadata falls
  back to Spotify's `oEmbed` endpoint.
- Spotify scannable images are generated via:
  - `https://scannables.scdn.co/uri/plain/svg/ffffff/black/640/{ENCODED_URI}`
- Spotify client secrets should never be shipped to the browser.

## Quality checks

```bash
pnpm lint
pnpm lint:types
pnpm test
```
