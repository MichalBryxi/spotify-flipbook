# Spotify Flipbook

Spotify Flipbook is a single-page Ember app for creating printable mini-booklets from Spotify tracks.
Each generated card includes:

- Album artwork
- Track title
- Artist name(s)
- Custom message
- Spotify scannable code (SVG)

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

## Input format

Use one row per line in the left editor:

```text
spotifyTrackUrl,custom message
```

Example:

```text
https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC,This one reminds me of our hike in Lauterbrunnen
```

## Generate + print flow

1. Paste one or more lines in the left panel.
2. Click `Generate`.
3. Preview pages render in the right panel as fixed A4 card grids.
4. Click `Print` to open the browser print dialog.

Print output is configured to:

- Use A4 pages with `10mm` margins
- Hide the left editor and UI controls
- Print only the preview pages with page breaks

## Data sources

- Track metadata is resolved client-side through Spotify Web API when
  `SPOTIFY_ACCESS_TOKEN` is present at build time.
- If no access token is configured or the API request fails, metadata falls
  back to Spotify's `oEmbed` endpoint.
- Do not ship Spotify client secrets to the browser.
- Spotify code images are generated using:
  - `https://scannables.scdn.co/uri/plain/svg/ffffff/black/640/{ENCODED_URI}`

## Quality checks

```bash
pnpm lint
pnpm lint:types
pnpm test
```
