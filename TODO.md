# Spotify Flipbook Implementation Plan

## Objective

Build a single-page Ember app that converts CSV-like Spotify track rows into a printable A4 mini-booklet preview. Each card must show artwork, title, artists, custom text, and a Spotify scannable code image.

## Step 1: Foundation and project wiring

- Add all core TypeScript domain types for parsed rows, resolved tracks, and render-ready entries.
- Ensure Tailwind + Frontile styling foundation is configured for this app (including Frontile plugin/source setup for Tailwind v4).
- Add root-level constants for page/card layout so print and preview dimensions stay consistent.
- Why: this creates a stable contract before UI/service work and prevents duplicated magic numbers.

## Step 2: Spotify integration services

- Add `spotify-resolver` service with a single public method `resolveTrack(url: string)`.
- Use a client-side metadata library that supports Spotify URLs; map output to a strict `ResolvedTrack` shape (`title`, `artists`, `artworkUrl`, `spotifyUri`).
- Add `spotify-scannable` service with `getScannableUrl(spotifyUri: string)` that builds Spotify scannables SVG URLs.
- Keep logic minimal and deterministic (no runtime validation, no caching for v1).
- Why: isolates external integration from UI and keeps route/controller focused on orchestration.

## Step 3: Route/controller state orchestration

- Add `index` route/controller pair for top-level app state.
- Controller tracked state:
  - `inputText` (prefilled examples)
  - `entries` (render-ready output)
  - `isLoading`
- Implement parsing (`split by line`, `split first comma`, join rest as message).
- Implement `Generate` action:
  - parse rows
  - resolve metadata concurrently
  - add scannable URL
  - store final render entries
- Why: centralizes user flow in one place and keeps components presentational.

## Step 4: Presentational GTS components

- Create focused components:
  - `FlipbookEditor` (left pane input + helper text + Generate button)
  - `FlipbookPreview` (right pane heading + print button + loading/empty/content)
  - `A4Pages` (chunk entries into fixed page groups)
  - `SongCard` (single card layout and truncation behavior)
- Use Frontile components for form/button primitives where appropriate (`Textarea`, `Button`).
- Keep component signatures strongly typed and argument-driven.
- Why: components remain reusable and easy to test visually.

## Step 5: Page template and print-first layout

- Build `index` template split into left/right panels.
- Add A4 preview frame and fixed card grid (2 columns × 4 rows, 8 cards/page).
- Implement print CSS rules:
  - `@page { size: A4; margin: 10mm; }`
  - hide editor/controls and all non-preview UI on print
  - ensure `.page` page breaks and no clipping
- Why: print output quality is a core product requirement.

## Step 6: Verification and polish

- Run lint, typecheck, and tests (`pnpm lint`, `pnpm lint:types`, `pnpm test` where feasible).
- Verify generated markup/classes for print and screen behavior.
- Update README with local usage notes (input format, generate, print flow).
- Why: ensures feature is usable by others and keeps codebase standards intact.

## Commit Plan

- Commit after each completed step with clear emoji-prefixed subjects.
- Keep each commit scoped to one logical milestone.

## Polaris Gap Remediation Plan (Current Focus)

### Gap A: Controller-heavy orchestration

- Move feature state and orchestration out of `app/controllers/index.ts` into a dedicated service.
- Introduce a small route-level workspace component to consume service state and delegate UI rendering.
- Keep editor/preview components presentation-focused and argument-driven.
- Why: aligns with modern Ember Polaris preference for simple, composable units and less controller-centric logic.

### Gap B: Manual async generation sequencing

- Replace `generationId` sequencing logic with explicit cancellation using `AbortController`.
- Ensure new generation runs cancel in-flight requests to avoid stale updates.
- Why: removes custom race-control logic and makes async behavior explicit and maintainable.

### Gap C: Direct `fetch` with lint bypass

- Refactor Spotify resolver network calls to use Warp Drive request pipeline (`store.request` + typed response handling).
- Remove eslint disables for external fetch patterns.
- Why: aligns with Warp Drive/Polaris request architecture and keeps transport behavior consistent.

### Gap D: Frontend exposure of Spotify client secret

- Remove `spotifyClientSecret` client-side config usage.
- Support optional pre-provisioned access token for enhanced metadata lookups, with oEmbed fallback.
- Update docs and tests accordingly.
- Why: avoids shipping confidential credentials to browser clients.

### Execution Order

- 1. Extract state/orchestration to a dedicated flipbook service + workspace component.
- 2. Apply cancellation-based async generation flow (`AbortController`).
- 3. Migrate resolver I/O to Warp Drive request APIs.
- 4. Remove client-secret usage, finalize env/docs/tests for secure client behavior.
