# Tests hardening and README corrections

## Scope

- Edited: `__tests__/App.test.tsx`, `README.md`. No app code touched (`App.tsx`, `src/**` unchanged).
- Reference: `ui-prototype/js/app.js`; prior review `code-review-261113-1235-rn-prototype-port.md` (Test Gaps, README Accuracy) and `fix-review-findings-report-261113-1240.md`.

## 1. Weak Services-return assertions fixed

`App.test.tsx` previously asserted `hasText('VnExpress')` / `hasText('2048')` / `hasText(service)` after pressing Services. The provider page's service bar shows the same text, so the assertions passed even if navigation failed. Replaced all three with a shared `showsServiceList(service)` check (News test, Game test, Video/Music loop): the service-row button with that label exists AND no node with a `sourceUrl` prop (BrowserView) is rendered AND "Simulated playback" is absent.

Probe (throwaway `__tests__/services-weakness-probe.test.tsx`, run then deleted): with Services never pressed, on the News provider page the old `hasText('VnExpress')` passes while the new checks fail with exactly `['service-row button missing', 'BrowserView rendered']`; on the Video provider page they fail with `['service-row button missing', 'player rendered']`. Exit 0. The new assertions genuinely distinguish category screen from provider page.

## 2. Regression tests added (behaviour names)

1. **Email with no local part rejected on register** — `@@a.bc` + matching passwords → "Enter a valid email address." shown, no account-created notice. (Guards the H1 crash loop fix; regex in `store.tsx` auth now requires a non-`@` local part.)
2. **Offline + hardware Back** — open News to ready (browser rendered), Services, Demo controls → Go offline, then simulated Android hardware Back (`jest.spyOn(BackHandler, 'addEventListener')` captures the handler from `AppProvider`): "Couldn't load VnExpress" renders, no BrowserView, no player. (Guards H2: provider pages must not render while offline.)
3. **Offline on a ready page** — Video ready with player, toggle Go offline → "Couldn’t load YouTube", player gone. (Guards the render-side `phase === 'error' || app.offline` branch.)
4. **News and Game provider row** — after the 450 ms load, "Provider account · Guest" and the "Provider sign-in" button render, and the row's document position is after the `BrowserView` node. (Guards M1.)
5. **Device 2 restore** — demo sign-in → Prepare a sample Device 1 session ("Prepared VnExpress for Avery on Device 1." in the sheet — this is the app.js-true copy; the task brief's "Prepared News for …" wording matches neither the RN app nor the prototype, which use the service name) → Start fresh on Device 2 → "Device 2 is ready. Sign in with the same AIOHub account." → demo sign-in → Simulated restoration → Restore service sessions → 850 ms → success notice → Open restored service → 450 ms → "Provider account" and "Avery · VnExpress" shown.
6. **Empty sign-in submit** — "Enter a valid email address." and "Enter a password." verbatim.
7. **Device 2 from sign-in clears form** — typed email + wrong-password error, Start fresh on Device 2 → email field value `''`, auth error gone, device-2 notice shown. (Guards M2: `AuthScreen` re-keyed by `route.page + data.device`.)

All tests drive the UI through accessibility labels/text with the suite's existing fake timers; no Metro, emulator or Gradle.

## 3. README corrections

- Line 36: "The app reproduces the prototype's behaviour" → "The app is ported from the prototype with listed deviations", naming the deviations (News/Game load real sites where the prototype showed sample articles and a native 2048 board; `<select>` menus became button groups) before the flows that match. Also fixed the same line's Demo-controls claim: the sheet holds Start fresh on Device 2 / Return to Device 1 / Prepare a sample Device 1 session (plus offline toggle, previews, reset); the restore simulation is opened from the "Simulated restoration" button on Home or the Account sheet on Device 2.
- Line 65: Jest-suite coverage list updated to include the new tests (both edits keep every claim true to the code).

## 4. Commands and exit codes

| Command | Exit code |
|---|---|
| `npx jest __tests__/services-weakness-probe.test.tsx --runInBand` (throwaway probe, deleted after) | 0 |
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm test -- --runInBand` | 0 — 2 suites, 13/13 tests pass (`__tests__/App.test.tsx` 12, `__tests__/sha256.test.ts` 1) |

Done evidence: typecheck, lint and jest all exit 0 with the new tests included.

## Notes

- The hardware-back spy replaces `BackHandler.addEventListener` globally for the suite; the real RN implementation is a no-op stub on iOS, and the store's subscription is only observable through the captured handler, so mocking is the only faithful way to exercise the back path in Jest.
- No app bugs found by the new tests; all previously reported defects (H1, H2, M1, M2) are covered by the added regressions and behave fixed.
