# Phase 2A — Shell screens and router

**Status:** complete · **Depends on:** 1 · **Parallel with:** 2B

## Files (owned)

- `App.tsx` — `SafeAreaProvider` → `AppProvider` → status bar (dark content) → paper background → `BrandHeader` + routed screen + `Panels`. Render nothing (or a plain paper view) until `ready`. Route `provider` to `src/screens/provider.tsx` default export (owned by 2B; import it, do not write it).
- `src/screens/welcome.tsx` — cassette art, "Your media,\nin one place." (second line indigo), copy, Sign in / Create account / Use demo account.
- `src/screens/auth.tsx` — sign in and register (route.page decides), back to Welcome, notice, fields with inline errors, form error, submit disabled while pending, switch link, demo button on sign-in. Email keyboard, autoCapitalize none, secure password.
- `src/screens/home.tsx` — home art with "Your hub", Categories heading, 2×2 tile grid (Video/Music/News/Game with token icon, arrow, service name), "Simulated restoration" button when on D2.
- `src/screens/category.tsx` — back to Home, title, "Services", single service row or empty state when `held==='empty'`.
- `src/screens/restore.tsx` — outcome picker (use three selectable buttons instead of `<select>`), status notice with spinner, action buttons per restoreState as in `restorePage()`.
- `src/screens/panels.tsx` — the three sheets (`demo`, `account`, `provider`) from `panel()` in app.js. Category picker as selectable buttons.

## Rules

Use only Phase 1 primitives/tokens/store; do not edit `src/components/**`, `src/state/**`, `src/theme/**` (report needed changes instead). Copy every user-facing string verbatim from `ui-prototype/js/app.js`. Add `accessibilityRole`/`accessibilityLabel` matching the prototype `aria-label`s (e.g. "Account menu", "Demo controls", "Close …").

## Done when

`npm run typecheck` and `npm run lint` pass for owned files (provider import may be missing until 2B lands; coordinate by default export name `ProviderScreen`).
