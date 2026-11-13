# Phase 2A — Shell screens and router (report)

**Date:** 2026-11-13 · **Worker:** OMP `llmshit/rl/z-ai/glm-5.3` · **Spec:** `phase-02a-shell-screens.md`

## What was built

- `App.tsx` — `SafeAreaProvider` → `AppProvider` → dark-content `StatusBar` → paper `SafeAreaView`; renders nothing until `ready`; `BrandHeader` (account initial, demo controls, offline banner), routed screen, `Panels`. Routes: welcome, signin/register, home, category, restore, and `provider` → default export from `src/screens/provider.tsx` (2B's file, imported only).
- `src/screens/welcome.tsx` — cassette art (`require('../assets/pocket-mixtape.webp')`, aspect 1.15, rounded 19, `#aba2fb` backing), "Your media," / indigo "in one place.", lead copy, Sign in (primary, forward icon) / Create account / Use demo account (quiet, user icon).
- `src/screens/auth.tsx` — sign-in/register by `route.page`, BackLink "Welcome", subtitle with device status text, notice on auth pages only, Email (email keyboard, no autocap) / Password / Confirm password fields with per-field inline errors and `auth` form error, submit disabled while pending, switch link, demo button on sign-in.
- `src/screens/home.tsx` — home art (132px, rotated sleeve, flat lilac fade approximating the prototype gradient — `ponytail` comment), "Your hub", "Categories" + sub, 2×2 tile grid with per-category tint/accent tokens, token icon + arrow + name/service, "Simulated restoration" tonal button on D2 (resets restore state via `setOutcome(outcome)` on entry, matching `handle('restore')`).
- `src/screens/category.tsx` — BackLink "Home", title, "Services", service row (tint background, token, provider name, end arrow) or empty `StateCard` when `held==='empty'`.
- `src/screens/restore.tsx` — BackLink "Home", title, sub, "Demo outcome" as three selectable buttons (Success/Expired/Unsupported, disabled during progress, `accessibilityState.selected`), status notice with `Spinner` during progress, message map for all seven restore states, and action buttons exactly per `restorePage()`: go ("Restore service sessions" or "Retry"), "Open restored service" on success, "Provider sign-in" on missing/expired/unsupported.
- `src/screens/panels.tsx` — three sheets: `demo` (demo-account picker A/B, category picker as buttons, hold Service loading/Empty category/Page-load error, Go online/offline, devices hint, Start fresh on Device 2, Return to Device 1 on D2, Prepare a sample Device 1 session when signed in, seeded-session notice when it is a "Prepared …" message, Reset demo), `account` (name, email · device, restore row on D2, Log out), `provider` (sub copy, Continue as …, Cancel). Titles and close labels ("Close Demo controls" etc.) come from `Sheet`.

## Copy fidelity

All user-facing strings verbatim from `ui-prototype/js/app.js`; the module-level `articles`/news/game/media content belongs to 2B. Accessibility labels match prototype aria-labels ("Account menu", "Demo controls", "Close …" via `Sheet`); tiles, service rows, and picker buttons use explicit labels or text-derived names.

## Verification

- `npx tsc --noEmit` — 0 errors across all files (including 2B's provider.tsx which landed mid-task).
- `npx eslint App.tsx src/screens/{welcome,auth,home,category,restore,panels}.tsx` — exit 0.
- Throwaway jest probe (deleted after the run) with react-test-renderer, mocked AsyncStorage/safe-area/BrowserView, exercised: welcome copy → demo sign-in → home with 4 labelled tiles → category service row → demo sheet open/close → empty-category hold → offline toggle; register (confirm field, account-created notice) → wrong-password error → correct sign-in → account sheet → log out back to sign-in; seed session → Start fresh on Device 2 → sign-in notice → "Simulated restoration" entry (state reset) → Restore → progress spinner → success notice + "Open restored service". All 3 tests passed.

## Local workarounds (foundation gaps, not edited — outside ownership)

1. `store` never clears `notice` on navigating to welcome/signin/register (prototype `handle` does). Worked around: auth screen shows `notice` only on auth pages; demo sheet shows it only when it starts with `"Prepared "`. The residual case: after `returnDevice1`, "Back on Device 1." persists in store and shows on the sign-in screen — same as prototype.
2. No store action resets `restoreState` on entering the restore screen (prototype `handle('restore')`). Worked around at both entry points (home button, account sheet row) by calling `setOutcome(outcome)`, which clears it as a side effect.
3. `Icon` accepts no `style` prop — positioned icons wrapped in `View`s.
4. RN 0.88 generated types expose only `StyleSheet.absoluteFill` (not `absoluteFillObject`); fade uses literal absolute props.

## Deviations

- Home-art gradient is a flat translucent fill (RN has no linear-gradient primitive without a new dep); `ponytail` comment marks the upgrade path.
- `<select>` controls (demo outcome, demo category) are button groups per spec ("use three selectable buttons instead of `<select>`", "Category picker as selectable buttons"); demo-category picker is 4 buttons in a row rather than a dropdown.
- Prettier is not enforced by the repo ESLint config (phase-1 files also deviate); files follow the existing one-line-object style.

Status: DONE
Summary: Ported the six shell screens and App router per spec with verbatim prototype copy; tsc and eslint pass on all owned files and a throwaway render probe verified welcome/auth/home/category/restore/panels flows end to end.
Concerns/Blockers: Foundation gaps worked around locally (notice lifecycle, restore-state entry reset — see report); no blockers.
