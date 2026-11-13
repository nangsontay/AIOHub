# Phase 1 — Foundation

**Status:** complete · **Blocks:** 2A, 2B

## Context

Source of truth: `ui-prototype/js/app.js` (state, routing, actions), `ui-prototype/css/app.css` (tokens, layout), `ui-prototype/js/digest.js` (SHA-256), `ui-prototype/assets/` (mark.svg, pocket-mixtape.webp). See `plan.md` decisions.

## Files (owned)

- `package.json`, `package-lock.json` — add `react-native-svg`, `@react-native-async-storage/async-storage` (`npm install`, pick versions compatible with RN 0.88 New Arch).
- `src/assets/pocket-mixtape.webp` (copy), `src/components/brand-mark.tsx` (mark.svg rendered with react-native-svg).
- `src/theme/tokens.ts` — colours (`ink #201d2c`, `muted #605c6c`, `indigo #4a36a5`, `line #ddd9e4`, `paper #fffeff`, `soft #f5f3fa`, `err #9d293a`, `lav #eae5ff`, tonal `#efebfa`, category tile/token colours from `.video/.music/.news/.game`, cover colours), radii, spacing, type scale.
- `src/components/icon.tsx` — `<Icon name={IconName} size? color? strokeWidth? />` using the `paths` map from app.js (stroke, round caps/joins, 24 viewBox).
- `src/components/ui.tsx` — `Button` (`variant: 'primary'|'second'|'tonal'|'quiet'`, `icon?`, `iconEnd?`, `small?`, `disabled?`, `accessibilityLabel?`), `BackLink`, `BrandHeader` (logo, account initial button, ⋯ demo button, offline banner), `StateCard` (`symbol: IconName|'loading'`), `MenuRow`, `Field` (label, TextInput, error text), `Notice`, `Spinner`, `Screen` (scroll container with `.stage` padding).
- `src/components/sheet.tsx` — bottom-sheet `Modal` with title, close button, scrollable body; closes on backdrop and Android back.
- `src/state/catalog.ts` — `Cat`, `cats`, `serviceUrls` (`News: https://vnexpress.net/`, `Game: https://play2048.co/`), `demos`, `videos`, `tracks`, `formatTime`.
- `src/state/sha256.ts` — port `portableSHA256` + `digest(password, salt)` on UTF-8 bytes.
- `src/state/store.tsx` — `AppProvider` + `useApp()`.

## Store contract (phases 2A/2B code against this)

```ts
type Route =
  | { page: 'welcome' | 'signin' | 'register' | 'home' | 'restore' }
  | { page: 'category'; cat: Cat }
  | { page: 'provider'; cat: Cat; phase: 'loading' | 'ready' | 'error' };
type PanelName = 'demo' | 'account' | 'provider' | null;
type RestoreState = '' | 'progress' | 'success' | 'expired' | 'unsupported' | 'missing' | 'offline';
```

`useApp()` exposes state `{ ready, data, route, canGoBack, held, offline, notice, prefill, chosenDemo, outcome, restoreState, panel, demoCat }` and actions mirroring `handle()` in app.js:
`navigate(route, replace?)`, `back(): boolean`, `goHome()`, `goCategory(cat)`, `openService(cat, sticky?)`, `finishLoad()`, `retry()`, `register(email, pw, confirm): Promise<FieldErrors|null>`, `signIn(email, pw): Promise<FieldErrors|null>`, `demoLogin()`, `logout()`, `openPanel(name)`, `closePanel()`, `chooseDemo('a'|'b')`, `setDemoCat(cat)`, `hold('loading'|'empty'|'error')`, `toggleOffline()`, `startDevice2()`, `returnDevice1()`, `seedSession()`, `providerSignIn()`, `providerSignOut()`, `session(cat, device?)`, `who()`, `setOutcome(v)`, `runRestore()`, `restoredOpen()`, `restoreManual()`, `resetDemo()`.

Behaviour must match app.js: auth guard redirect to signin, 450 ms load timer with ticket cancellation, 850 ms restore, session keys `[device,user,cat]`, D2 wipe, validation messages verbatim, offline error during sign-in, seed-session notice inside the demo sheet. Persist `data` under AsyncStorage key `aiohub-pocket-v1`; `ready=false` until hydrated. Android hardware back (`BackHandler`): close sheet → `back()` → otherwise default.

## Steps

1. Install deps; confirm `npx tsc --noEmit` still passes.
2. Write tokens, icon, brand mark, primitives, sheet.
3. Write catalog, sha256 (verify `digest('abc','')` = `ba7816bf…15ad`), store.
4. Run `npm run typecheck` and `npm run lint` on the new files.

## Done when

Typecheck and lint pass; store and primitives are exported as above; no screens yet.
