# Code Review: React Native port of ui-prototype

## Scope
- Files: App.tsx; src/state/{store.tsx,catalog.ts,sha256.ts}; src/components/{ui,sheet,icon,brand-mark}.tsx; src/theme/tokens.ts; src/screens/{welcome,auth,home,category,restore,panels,provider,media-player,web-service}.tsx; __tests__/{App.test.tsx,sha256.test.ts,setup.ts}; jest.config.js; README.md; android/gradle.properties:54
- Reference: ui-prototype/js/app.js, ui-prototype/js/digest.js; plan plans/261113-1122-port-ui-prototype/plan.md
- Mode: full-file review (no git repo, no diff)
- Checks run: `npx tsc --noEmit` (0 errors), `npm run lint` (clean), `npx jest --runInBand` (6/6 pass). No Metro, emulator or Gradle.
- Verification method: every finding marked "probe-confirmed" was reproduced with a throwaway Jest test in the session scratchpad (`/private/tmp/claude-501/-Users-nangsontay-AIOHub/ee4be46c-a49d-4358-b2a8-3507a314e119/scratchpad/t/probe.test.tsx`), which uses the project's jest config and setup. No project files were edited.

## Overall Assessment
The port is close to the prototype: copy, demo-control actions, session keys `[device,user,cat]`, the Device 2 wipe, restore outcomes, and the load/restore ticket cancellation all match app.js. The SHA-256 port is correct: it matches the NIST "abc" vector, and the 64-bit length split is equivalent to `setBigUint64`. The single mutable-closure store with a force-render works because every read goes through the live closure (`session()`, `who()`) or a snapshot taken on each render. I found no stale-closure or timer-leak bugs. I did find one crash loop, one offline-state bypass, and two flow divergences. All four are probe-confirmed. The tests cover only happy paths, so they miss all four.

## Critical Issues
None.

## High Priority

### H1. An email address with an empty local part passes validation and crashes the app on every launch (probe-confirmed)
- `src/state/store.tsx:159` validates with `/^\S+@\S+\.\S+$/` only. The prototype also requires `form.email.validity.valid` (app.js:177), and HTML email validity rejects `@` in the local part. RN dropped that check.
- `@@a.bc` (and anything starting with `@`) passes the regex. After sign-in, `who()` (`store.tsx:86-88`) returns `''.split('@')[0]` = `''`. Then `App.tsx:39` evaluates `who()[0].toUpperCase()`, and `undefined.toUpperCase()` throws during render. Nothing catches the error.
- `data.user` is persisted before the render (`startUser`, store.tsx:115-116), so `hydrate()` restores the same user on every relaunch and the app crashes on startup each time. The only recovery is clearing app data.
- Probe: register `@@a.bc`/`pw`, sign in → `TypeError: Cannot read properties of undefined (reading 'toUpperCase')`. The persisted user is `@@a.bc`, and a fresh mount throws the same error.
- Fix: tighten the boundary regex to `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (this also rejects `a@b@c.d`, as the HTML check did). Also make the header safe: `initial={data.user ? (who()[0] ?? '?').toUpperCase() : undefined}`, or have `who()` fall back to `'Guest'` when the result is empty. Consider validating `parsed.user` in `hydrate()` (see L1).

### H2. While offline, hardware Back can show a provider page, including the real website (probe-confirmed)
- In the prototype, `provider()` renders the error card when `route.phase==='error' || offline` (app.js:66), and hides the session row when offline (app.js:68). RN `src/screens/provider.tsx:60` checks only `phase === 'error'`. `back()` (`store.tsx:100-112`) changes the phase only for `loading` routes.
- Scenario: open YouTube (ready) → Services → Demo controls → Go offline → Android hardware Back. `back()` pops `{provider, Video, ready}`, and the simulated player renders under the "Offline · Service pages are unavailable" banner (probe: `player=true error=false`). With News or Game, the same path mounts `BrowserView` and loads vnexpress.net or play2048.co while the app says it is offline.
- Fix: in `ProviderScreen`, use the error branch when `phase === 'error' || app.offline` and the phase is not `loading`. Alternatively, have `back()` map a popped provider route to `error` when `offline` is set, but the render-side check matches app.js exactly.

## Medium Priority

### M1. On the default restore path, the user cannot see the restored identity (probe-confirmed)
- `openPanel('demo')` defaults `demoCat` to `'News'` when the route has no category (`store.tsx:278`), so "Prepare a sample Device 1 session" seeds VnExpress. `restoredOpen` (`store.tsx:404-409`) then opens News. News renders only `WebService` (`provider.tsx:82-87`). The provider-account row exists only in `MediaPlayer` (`media-player.tsx:137-154`).
- Result: the success copy says "Restored. Open the service to see your Device 1 provider identity.", but the opened page has no identity row (probe: `identity visible: false`, browser mounted). "Provider sign-in" from `restoreManual` on News or Game has the same problem: `providerSignIn` succeeds, but nothing shows the result. In the prototype, `serviceStatus()` is rendered for every ready provider (app.js:68).
- This is not covered by the accepted "real website" decision. The plan mentions the provider sign-in row only under Video/Music, so this needs a product call. Options: (a) render the session row under the `BrowserView` for News and Game, (b) default `demoCat`/`restoredOpen` to a media category, or (c) change the restore success copy.

### M2. "Start fresh on Device 2" and "Return to Device 1" from the sign-in page keep the old form state (probe-confirmed)
- `AuthScreen` is keyed by `route.page` (`App.tsx:22`) and seeds its state once with `useState(prefill)` (`auth.tsx:19-22`). `startDevice2` (`store.tsx:319-336`) and `returnDevice1` → `logout` (`store.tsx:121-131`, `337-343`) navigate from `signin` to `signin`, so the component is not remounted.
- Scenario: on Sign in, type `x@y.zz` with a wrong password and submit → Demo controls → Start fresh on Device 2. The new "Device 2 is ready…" notice appears, but the old email, the password, and the "Email or password is incorrect" alert stay on screen. The `prefill = ''` reset has no effect. The prototype rebuilds the form on every render, so it starts clean.
- Fix: key the auth screen by a navigation counter or by `route.page + data.device + notice`. Alternatively, have the store push a fresh route object and key on route identity.

### M3. Accessibility: validation errors are not announced, and focus does not move
- Field and auth errors use `accessibilityRole="alert"` (`ui.tsx:179`, `auth.tsx:80`), but they have no `accessibilityLiveRegion`. TalkBack does not announce a role change by itself. The prototype pairs `role=alert`/`aria-live` with focusing the first invalid field (app.js:52, 181-182).
- RN also does not move accessibility focus to the new screen's heading on navigation (app.js:104). It also has no equivalent of `announce()` for "Provider signed in.", "Back online.", or "Prepared … on Device 1." (app.js:146, 155, 158).
- Fix: add `accessibilityLiveRegion="assertive"` to the error texts. After a failed submit, focus the first invalid input with a ref, or call `AccessibilityInfo.setAccessibilityFocus`. Use `AccessibilityInfo.announceForAccessibility` for the three announcements.

## Low Priority

- **L1. Hydration accepts some malformed data.** `store.tsx:220-226` passes `accounts: null` and `sessions: null` (`typeof null === 'object'`) and does not check the type of `user`. With null accounts, `register` throws at `Object.hasOwn` (`store.tsx:166`), outside the `try`. Because `AuthScreen.submit` (`auth.tsx:25-33`) has no `try/finally`, `pending` stays true and the submit button stays disabled. Null sessions crash `session()` on a media page. Fix: add `!== null` and string checks, and wrap `submit` in `try/finally`. This only affects corrupt or foreign storage. It is still stricter than the prototype.
- **L2. Restore can get stuck in "progress" (inherited from app.js:39/133).** Start a restore → Home → hardware Back. `cancel()` invalidates the timer, but `restoreState` stays `'progress'`, so the restore screen shows a spinner with no buttons (probe: `stuck progress: true button: 0`). Android hardware Back makes this easier to reach than browser Back. Cheap fix: in `navigate`/`back`, reset `restoreState` to `''` when it is `'progress'`.
- **L3. Hardware Back can return a signed-in user to Welcome (inherited from app.js:121).** `hold()` (`store.tsx:296-304`) clears the stack and then `navigate` pushes the current `welcome` route. After using a Demo hold from Welcome, Back lands a signed-in user on Welcome.
- **L4. Pressing Enter on the keyboard does not submit the auth form.** `auth.tsx:52-78` has no `onSubmitEditing`/`returnKeyType="go"`. In the prototype, Enter submits the form.
- **L5. `Notice` wraps children in `<Text>`.** `restore.tsx:72-77` passes a `View` (spinner plus a `flex:1` Text), which makes an inline view inside Text. Check the wrapping and width on a device, or let `Notice` accept non-text children without the Text wrapper.
- **L6. The home tile's accessibility label is only the category.** `home.tsx:40` sets the label to "Video", while the visible tile also shows "YouTube". The label overrides the content, so screen readers lose the service name.
- **L7. Minor clean-ups.** `canGoBack` (`store.tsx:202`) is unused. `cat.toLowerCase() as never` (`home.tsx:46`, `category.tsx:40`) bypasses the `IconName` type; a typed map would be safer. Media `h1` (`media-player.tsx:67`) lacks `accessibilityRole="header"`.

## Edge Cases Found by Scouting
- The guard in `navigate` (`store.tsx:91-95`) redirects to `signin` but still pushes the previous route and does not clear the stack, unlike app.js:100. I found no path that leaves a protected route on the stack with a null user (logout, Device 2 and reset all clear the stack), so this is not a defect today.
- `openService` reads `ticket` after `navigate` has already cancelled the old timer (`store.tsx:136-150`), so stale 450 ms timers cannot overwrite a newer route. `runRestore` also cancels first. Verified correct.
- The `MediaPlayer` interval is re-armed on each `elapsed` change and cleaned up on unmount and pause. It stops at the end of the track. When the track finishes, a full progress bar shows for one render before the reset, which is cosmetic.
- `save()` takes a snapshot when called and chains the writes, so writes cannot reorder. Errors are swallowed, as in the prototype. If a hydrate read fails, the app starts fresh and the next `save()` overwrites the stored accounts. This is inherited behaviour, noted for awareness.
- No StrictMode in `index.js`, so `hydrate()` does not run twice.

## Test Gaps
- `App.test.tsx:95-96` and `109-110` assert `hasText('VnExpress')`/`hasText('2048')` after pressing Services. The provider service bar also shows that text, so the assertion passes even if navigation fails. Assert on something only the category screen shows (for example the "Services" subtitle together with the service row's accessibility label), or assert that the browser is absent.
- Not covered: offline toggle, hardware Back (`BackHandler`), Demo holds, Device 2 wipe, restore outcomes, and validation messages. H1, H2, M1 and M2 all live in these paths. Capturing the handler with `jest.spyOn(BackHandler, 'addEventListener')` works with this preset; `mockPressBack` is not available.

## README Accuracy
- `README.md:36` says the Demo controls sheet holds the "Device 2 restore simulation". It actually holds "Start fresh on Device 2", "Return to Device 1" and "Prepare a sample Device 1 session". The restore simulation itself is opened from the Account sheet or from Home.
- `README.md:36` "The app reproduces the prototype's behaviour" is overstated until H2, M1 and M2 are fixed or documented.
- `README.md:59` APK build claim: I did not re-verify it (a Gradle build was running in parallel). `android/gradle.properties:54` does contain `AsyncStorage_kspVersion=2.3.12`, as described at README:63.

## Plan Acceptance Status (plans/261113-1122-port-ui-prototype/plan.md)
1. typecheck, lint, test: pass (re-run in this review).
2. Android assembleDebug: not verified here.
3. Jest coverage list: present, with the weak Services-return assertion noted above.
4. Screens, sheets and copy: copy matches app.js for every screen and sheet I checked. The behaviour divergences H2, M1 and M2 mean "behaves like" is not yet fully met.

## Recommended Actions
1. H1: tighten the email regex and make the header initial null-safe. This is a one-line fix each and removes a persistent crash loop.
2. H2: add the `offline` check to the error branch in `ProviderScreen`.
3. M2: re-key `AuthScreen` so device switches reset the form.
4. M1: get a product decision on the identity row for News/Game, or change the restore default.
5. M3: add live regions and focus handling for errors.
6. Add Jest cases for offline + Back, Device 2 from sign-in, the restore flow, and an email with an empty local part.

## Metrics
- Type errors: 0. Lint issues: 0. Tests: 6/6 pass. Coverage was not measured.

## Unresolved Questions
- M1: should News and Game show the provider-account row under the website (prototype parity), or should the restore demo target a media category?

Status: DONE_WITH_CONCERNS
Summary: The port matches app.js in most flows, and typecheck, lint and tests pass. Four defects are probe-confirmed: a persistent startup crash from emails with an empty local part, hardware Back showing provider pages while offline, a restore success path that cannot show the restored identity on News/Game, and a stale sign-in form after a device switch.
Concerns/Blockers: Android APK build not re-verified (parallel build). M1 needs a product decision.
