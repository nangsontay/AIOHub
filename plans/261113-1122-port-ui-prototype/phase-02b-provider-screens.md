# Phase 2B — Provider screens

**Status:** done · **Depends on:** 1 · **Parallel with:** 2A

## Files (owned)

- `src/screens/provider.tsx` — default export `ProviderScreen`. Service bar (BackLink "Services" → `goCategory`, service name). Phases: loading StateCard ("Opening X…", "Finish loading" when held loading), error/offline StateCard with Retry + Back, ready → `WebService` for News/Game, `MediaPlayer` for Video/Music.
- `src/screens/web-service.tsx` — fills remaining space with `BrowserView` from `src/browser/browser-view` and `sourceUrl={serviceUrls[cat]}`. No provider session row (real site handles its own login).
- `src/screens/media-player.tsx` — port `mediaPage()` + `togglePlayback()`: title, search form (Video only: TextInput + Search button, "No videos match this search."), player card (cover with category colour + icon, "Simulated playback", name, artist, progress bar, `m:ss / m:ss`, Play/Pause), list of items with active state; pick → restart and play. Interval cleaned on unmount, on cat change, and when `offline` becomes true. Below it the provider session row from `serviceStatus()` (Provider sign-in → `openPanel('provider')`, Sign out → `providerSignOut`).

## Rules

Use only Phase 1 primitives/tokens/store; do not edit shared folders or `src/browser/**`. Copy strings verbatim from `ui-prototype/js/app.js`. The browser view must get `flex: 1` and must not be inside a ScrollView.

## Done when

`npm run typecheck` and `npm run lint` pass for owned files.
