# Phase 3 — Verify, tests, docs

**Status:** done · **Depends on:** 2A, 2B

## Files (owned)

`__tests__/**`, `jest.config.js` (mocks/transformIgnorePatterns), `README.md`. May fix integration bugs anywhere, reporting each fix.

## Steps

1. Jest: mock `@react-native-async-storage/async-storage` (official jest mock), `react-native-safe-area-context`, `../src/browser/browser-view`; handle `react-native-svg` (transform or mock). Replace `__tests__/App.test.tsx` with flows from plan acceptance criterion 3; add a `sha256` unit test.
2. `npm run typecheck`, `npm run lint`, `npm test -- --runInBand`.
3. `cd android && ./gradlew --no-daemon :app:assembleDebug -PreactNativeArchitectures=arm64-v8a`.
4. README: update Structure, dependencies and the run/behaviour description (News/Game real sites, Video/Music simulated, demo controls).

## Done when

All four checks pass and README matches the code.
