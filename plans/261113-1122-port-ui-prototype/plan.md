---
title: "Port ui-prototype into the React Native app"
description: "Rebuild the HTML/CSS/JS prototype's screens in React Native; News and Game open real sites in GeckoView, Video and Music keep the simulated players."
status: in-progress
priority: P1
effort: 1h
tags: [frontend, mobile, react-native]
blockedBy: []
blocks: []
created: 2026-11-13
---

# Port ui-prototype into the React Native app

## Outcome

The RN app (`/Users/nangsontay/AIOHub`) looks and behaves like `ui-prototype/` (light lilac/indigo design, welcome → sign in/register → home → category → service, account and demo-control sheets, loading/empty/error/offline states, simulated Device 2 restoration), replacing the current dark service list in `App.tsx`.

## Decisions (user-confirmed)

- **News → VnExpress** (`https://vnexpress.net/`) and **Game → 2048** (`https://play2048.co/`) load the real website in the existing GeckoView `BrowserView`. The prototype's sample articles and native 2048 are not ported.
- **Video → YouTube** and **Music → Spotify** keep the prototype's simulated player (sample list, search for video, play/pause timer, progress) and provider sign-in row.
- Everything else from the prototype is ported: demo accounts, local accounts with salted SHA-256, demo controls, Device 2 restore simulation, persistence (AsyncStorage instead of localStorage).

## Constraints

- RN 0.88.1, React 19.3, New Architecture, TypeScript. Keep the existing GeckoView native component and `src/browser/*` untouched.
- New native deps allowed: `react-native-svg` (icons, logo) and `@react-native-async-storage/async-storage` (persistence). Both must build in the Android debug APK.
- Hermes has no `crypto.subtle`: port `ui-prototype/js/digest.js` `portableSHA256`. Salt from `Math.random` is acceptable (fictional demo accounts only).
- Offline is toggled only from Demo controls (no NetInfo dependency).
- System font (DM Sans is not bundled).

## Non-goals

Real provider auth, session export/import, NetInfo, iOS WebKit browser, GeckoView back/forward controls.

## Phases

| # | Phase | Depends on | Owner files | Status |
|---|-------|-----------|-------------|--------|
| 1 | [Foundation: deps, theme, icons, primitives, store](phase-01-foundation.md) | — | `package.json`, `src/theme/**`, `src/components/**`, `src/state/**`, `src/assets/**` | done |
| 2A | [Shell screens + router](phase-02a-shell-screens.md) | 1 | `App.tsx`, `src/screens/{welcome,auth,home,category,restore,panels}.tsx` | done |
| 2B | [Provider screens](phase-02b-provider-screens.md) | 1 | `src/screens/{provider,media-player,web-service}.tsx` | done |
| 3 | [Verify, tests, docs](phase-03-verify.md) | 2A, 2B | `__tests__/**`, `jest.config.js`, `README.md` | in-progress |

2A and 2B run in parallel with disjoint file ownership.

## Skill routing (per `~/.claude/rules/skill-domain-routing.md`)

| Phase | Tier → runtime/model (`task-tier-routing.md`) | Primary skill | Secondary |
|-------|----------------------------------------------|---------------|-----------|
| 1 | Tier 1 → Codex `gpt-6.1-terra` (shared store contract, native deps) | `ak-mobile-development` | `ak-ui-styling` |
| 2A, 2B | Tier 2 → OMP `llmshit/rl/z-ai/glm-5.3` (scoped screens against a fixed contract) | `ak-mobile-development` | `ak-frontend-design` |
| 3 | Tier 2 → OMP `llmshit/rl/z-ai/glm-5.3`; Android build debugging escalates to Codex | `ak-test` | `ak-docs` |
| Review | Claude (orchestrator) | `ak-code-review` | — |

Claude orchestrates and reviews only. Every worker reports to `plans/reports/` and ends with `Status / Summary / Concerns`.

## Acceptance criteria

1. `npm run typecheck`, `npm run lint`, `npm test -- --runInBand` pass.
2. `cd android && ./gradlew --no-daemon :app:assembleDebug -PreactNativeArchitectures=arm64-v8a` succeeds.
3. Jest covers: demo sign-in reaches home; home shows 4 category tiles; News and Game providers render `BrowserView` with the VnExpress / 2048 URL; Video/Music render the simulated player; back returns to the service list; register + sign-in with a local account works; logout returns to sign-in.
4. All prototype screens and sheets exist with matching copy, colours and layout intent.
