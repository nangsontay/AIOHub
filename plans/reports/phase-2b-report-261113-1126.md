# Phase 2B — Provider screens (report)

**Date:** 2026-11-13 · **Outcome:** done

## Files

- `src/screens/provider.tsx` — default export `ProviderScreen`. Service bar (`BackLink "Services"` → `goCategory(cat)`, service name), then by route phase: loading `StateCard` (`Opening X…` / `Loading the service page.`, "Finish loading" button only when `held === 'loading'`), error `StateCard` (offline symbol when `app.offline`, `Couldn’t load X`, Retry + Back), ready → `WebService` (News/Game) or `MediaPlayer` (Video/Music, remounted per category via `key={cat}`).
- `src/screens/web-service.tsx` — `BrowserView` with `sourceUrl={serviceUrls[cat]}`, `flex: 1`, no ScrollView wrapper, no session row (per spec).
- `src/screens/media-player.tsx` — port of `mediaPage()`/`togglePlayback()`: title, video-only search (TextInput aria-label "Search sample videos" + tonal Search button, "No videos match this search."), player card (cover in item colour + icon, "Simulated playback", name, artist, indigo progress bar, `m:ss / m:ss`, Play/Pause primary button), Videos/Tracks list with active item (2px indigo border matches prototype `box-shadow: inset`), pick → restart + play, provider session row ("Provider account · Guest" vs name, Provider sign-in → `openPanel('provider')`, Sign out → `providerSignOut`).

## Playback

`useEffect`-driven interval: created when `playing && !offline`, cleaned on unmount (also via `key={cat}` remount), category change, `offline` becoming true, and track end (elapsed resets, playing stops). Uses functional `setElapsed` updates; no stale closures.

## Verification

- `npx tsc --noEmit` — 0 errors (whole project as configured).
- `npx eslint src/screens/provider.tsx src/screens/media-player.tsx src/screens/web-service.tsx` — exit 0.
- No runtime/visual verification yet (no Metro/emulator per constraints); native behaviour is phase 3.

## Deviations / notes

- Player state lives in `MediaPlayer` (component-local) rather than the store; prototype had it global. Remounting with `key={cat}` reproduces `resetPlayer()` on category change, and phase transitions unmount it, matching prototype `back()`/`openService()` resets. Music search input never existed in the prototype; only Video gets the search form, exactly as in `app.js`.
- `goServices` closure used for both the service bar and the error Back button, matching prototype's `services` action.
- `.provider h2` (1.12rem ≈ 18px) and `.meta` (.82rem ≈ 13px) mapped to literal px rather than `typography.heading: 22` / `small: 12` tokens for visual fidelity; `spacing`/`radii`/`colors` tokens used everywhere else.
- Prototype refreshes the progress text via DOM node updates inside the interval; RN re-renders per tick through state — same visible result.

Status: DONE
Summary: provider.tsx, web-service.tsx, media-player.tsx implemented against the Phase 1 foundation; tsc and eslint clean; no store/shared edits needed.
Concerns: none.
