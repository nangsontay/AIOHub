# Journal: port ui-prototype into the React Native app

**Date:** 2026-11-13 (Asia/Bangkok) · **Plan:** `plans/261113-1122-port-ui-prototype/`

## What shipped

The HTML prototype now runs as the React Native app: welcome, sign in/register, home, category, service, restore screens and the demo, account and provider sheets, with the prototype's light lilac/indigo design. News (VnExpress) and Game (play2048.co) load the real sites in GeckoView; Video and Music keep the simulated players. State lives in one store (`src/state/store.tsx`) persisted to AsyncStorage, with a ported SHA-256 for local accounts.

## How it was delivered

Claude planned and reviewed; Codex (`gpt-6.1-terra`) did the foundation/store and two contract-fix rounds; OMP (`glm-5.3`) did the screens in two parallel phases, tests and README.

## What went wrong and why

- Two dispatch attempts failed before any code was written: the first worker blocked on the graft MCP approval prompt, and the second used the wrong runtime for the tier rules. Fix: enable graft for the project and route tier 1 to Codex only.
- The foundation stored a sheet-only message in the shared `notice` and had no actions for entering auth pages or the restore screen, so the screen worker invented workarounds (string-prefix filter, `setOutcome` side effect) and missed one call site. Lesson: a store contract should name every action the screens need; review screen reports for "workaround" sections.
- Final review found an email that crashed every launch, offline being bypassed by Android Back, and a restore success path invisible on News/Game. The happy-path tests caught none of them; regression tests now cover each.
- async-storage 3.1.1 picks a KSP plugin that breaks with Kotlin Gradle plugin 2.4.21; `AsyncStorage_kspVersion=2.3.12` in `android/gradle.properties` fixes it.

## Open items

- Visual check on a device or emulator has not been done (layout of the restore notice in particular).
- Back after a demo hold from Welcome can land a signed-in user on Welcome; inherited from the prototype and left as is.
