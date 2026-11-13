# Code review: RN port of prototype update cf7d574 (multi-service, guest mode)

Date: 2026-11-13. Read-only review of the uncommitted RN working tree against `ui-prototype/js/app.js` (cf7d574).
Plan: `plans/261113-1400-sync-prototype-multi-service/plan.md`.

## Scope

- Files: `App.tsx`, `src/state/{catalog.ts,store.tsx}`, `src/screens/{welcome,auth,home,category,provider,provider-session,web-service,media-player,panels,restore}.tsx`, `src/components/ui.tsx` (BrandHeader), `__tests__/App.test.tsx`, `README.md`.
- Gates run: `tsc --noEmit` exit 0; `eslint .` clean; `jest --runInBand` 16/16 pass.
- User-decided deviations (News/Game in GeckoView, Game = 2048 only, AsyncStorage, offline only via Demo controls) are not flagged.

## Overall

Most of the port matches app.js. Per-service keys, provider sign-in/out, seed-session (including the Game notice), restore (`restorableKeys`, `runRestore`, `restoredOpen`, `restoreManual` with the Music/Spotify fallback), the hidden provider row for Game, the guest header and panel, and the home restore button all behave like the prototype. There are two navigation defects:

1. The prototype's render guard was not ported.
2. The hardware-back rewrite stops a signed-in user from leaving the app. The pre-port RN app (HEAD) let them leave.

The tests miss both.

---

## High

### H1. A logged-out Home is reachable: welcome-from-guest keeps the stack, and the render guard is missing

- `src/state/store.tsx:297-305` (`openAuthPage`): when a guest goes to `welcome`, the code clears `data.guest` but does **not** reset `stack`. The prototype does `data.guest=false;save();stack=[];` before `navigate` (app.js:187).
- `src/state/store.tsx:125-142` (`back`) pops the stack and never re-checks auth. `App.tsx:18-31` renders whatever `route.page` is. Nothing ports the prototype's render guard (app.js:151: `if(!data.user&&!data.guest&&!['signin','register','welcome'].includes(route.page)){route={page:'welcome'};stack=[];}`).
- `navigate` (`store.tsx:111-116`) only guards forward navigation. It also pushes the current route when it redirects, and it does not clear the stack. The prototype's guard does `stack=[]`.

Repro (fresh install):
1. Tap Get started. Home opens as a guest with stack `[]`.
2. Tap the header `G` (Guest menu), then Sign in. Stack becomes `[home]`.
3. Tap the back link Welcome. Guest is cleared and stack becomes `[home, signin]`.
4. Press hardware Back. The Sign in page opens.
5. Press hardware Back again. **HomeScreen renders with `user=null, guest=false`.** There is no account button and the copy reads "Choose a service to open.". Tapping a tile goes to Welcome because of the navigate guard, and that pushes `home` again. Back then returns to the invalid Home, so the user can loop.

In the prototype, step 4 shows Sign in. Step 5 then hits `!stack.length && !data.user` and goes to Welcome (app.js:262).

Fix:
```ts
// store.tsx
const guard = () => {
  if (!data.user && !data.guest && !['welcome', 'signin', 'register'].includes(route.page)) {
    route = { page: 'welcome' };
    stack = [];
  }
};
// navigate: drop the pre-check, do `if (!replace) stack.push(route); route = next; guard(); update();`
// back: call guard() before update()
openAuthPage(page) {
  setPanel(null);
  notice = '';
  if (page === 'welcome' && data.guest) { data.guest = false; save(); stack = []; }
  navigate({ page });
},
```
Add a test that runs the five steps above and asserts that `Get started` is visible and `Your hub` is not.

### H2. A signed-in user can no longer leave the app with hardware Back (regression from HEAD)

- `src/state/store.tsx:127-129`: `back()` now falls back to `{page:'home'}` when the stack is empty and always returns `true`.
- `src/state/store.tsx:544-550`: with a signed-in user and an empty stack, the handler calls `store.back()`, which returns `true`, so Android never gets the event.
- HEAD returned `false` here (`if (data.user || route.page === 'welcome') return false;`), so the system exited or backgrounded the app. The prototype's `popstate` does nothing in this case, but that is only because a browser tab cannot exit. HEAD's RN behaviour was the deliberate Android adaptation.

Repro: open Demo controls, tap Use selected demo account, then press hardware Back on Home. Home re-renders and the app does not exit. This repeats on every press. It also applies after `startUser`, `restoreManual` and similar actions once the stack has drained back to Home.

Fix:
```ts
const { data, route, canGoBack } = store.state;
if (!canGoBack) {
  if (data.user || (route.page === 'welcome' && !data.guest)) return false;
  store.navigate({ page: 'welcome' }, true); // the guest leaves guest mode, as app.js:262 does
  return true;
}
return store.back();
```
Add a test: sign in with the demo account, then assert that `hardwareBack(...) === false` on Home.

---

## Medium

### M1. The tests miss the new guest and navigation contracts
`__tests__/App.test.tsx` has no coverage for:
- Leave guest mode (`leaveGuest`).
- Welcome-from-guest, then Back (H1).
- Hardware Back for a signed-in user on the root (H2).
- The render guard.
- `restoreManual` and its Music/Spotify fallback, or the expired/unsupported paths.
- Hydrate with a non-boolean `guest`.
- The player resetting when the service changes. Example: play YouTube to 0:03, then open Vimeo and assert `0:00` and `Paper Skies`.

All the H-level bugs pass CI because of these gaps.

### M2. Weak assertions in the new tests
- `App.test.tsx:374-383`: the Game check is `expect(pressables('Provider sign-in')).toHaveLength(0)`. It never confirms the 2048 page reached `ready` (`browserCount() === 1`), so it would also pass if the page were stuck loading or on the error card. Assert the browser first.
- `App.test.tsx:420-424`: "excludes games from sessions" only checks the notice text. Nothing proves that no Game session was written. Seed only Game, start Device 2, restore, and expect the `missing` message ("No eligible Device 1 session…").
- `App.test.tsx:449-458`: the test confirms that Back leaves guest mode, but not that `guest=false` was **persisted**. Unmount, re-render, and assert that Welcome shows.
- `App.test.tsx:372-373`: `pressables(service).length > 0` does not filter by `accessibilityRole: 'button'`. Filter it, as `showsServiceList` already does.

---

## Low

### L1. Hydrate accepts `user` and `guest: true` together
`src/state/store.tsx:266-270`: `guest` is only type-checked. A persisted blob with both set gives Guest-mode panels for a signed-in user. Home then shows the guest copy and the D2 restore button together. The prototype cannot produce this state; every writer keeps the two exclusive. Fix: `guest: parsed.user === null && parsed.guest === true`.

### L2. The README dropped the network security notes, but the setting still applies
`README.md` removed "All HTTP/HTTPS hosts and ports are permitted… Cleartext web navigation is intentionally enabled". `android/app/src/main/AndroidManifest.xml:12` still sets `usesCleartextTraffic="true"`. Restore the sentence. The README's test list also omits the new guest and multi-service tests.

### L3. Leftover empty fragment
`src/screens/auth.tsx:135-144` wraps a single `Button` in `<>…</>`, left over from the removed demo button.

---

## Verified to match app.js (no action needed)
- `serviceKey` (`store.tsx:90-91`) and restore iteration order (Video → Music → News) match `serviceKey` and `restorableKeys` (app.js:62-63).
- Provider confirm writes `who() + ' · ' + service` under `sessionKey(serviceKey)`. Sign-out deletes the same key. Guest sessions use the `[device,null,key]` key, as in the prototype.
- `seedSession`: Game writes nothing and shows "Games do not use provider sessions.". Other categories write a D1 session for the default service with the exact notice copy. The menu row only shows when `data.user` is set.
- `runRestore`, `restoredOpen` and `restoreManual` (offline opens the service; otherwise the provider page opens ready with the provider sheet) match app.js:149, 221-222.
- The player resets on a service change: `MediaPlayer` is keyed by `cat:service` (`provider.tsx:96`), and the loading and error phases unmount it.
- The provider row is hidden for Game and only shows in the ready, online phase (`provider.tsx:36-91`).
- Copy is verbatim: welcome buttons, home guest sub-copy and descriptions, category `Games`/`Services`, guest sheet (title, hint, Sign in, Create account, Leave guest mode), provider sheet ("…for this guest session." / "…AIOHub account."), and the header `Guest menu`/`Account menu` labels with the `G` initial.
- The home restore button shows only when `D2 && user` (`home.tsx:65`).
- `startGuest`, `startUser`, `logout`, `startDevice2` and `hold` (which plays the role of ensureDemo) set `guest` the same way as the prototype. The initial route is `home` when `user || guest`.

## Recommended actions
1. Fix H1: reset the stack in `openAuthPage('welcome')` and port the render guard into `navigate` and `back`.
2. Fix H2: return `false` from the BackHandler for a signed-in user with an empty stack.
3. Add regression tests for H1 and H2, and tighten the weak assertions in M2.
4. L1 to L3 are optional and low-cost.

## Unresolved questions
- H2: does the user want Back on a signed-in Home to exit, as in HEAD's RN app, or stay put, as in the browser prototype? HEAD shows exiting was chosen deliberately, so this report treats the current behaviour as a regression.
