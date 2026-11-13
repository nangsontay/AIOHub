---
title: "Sync RN app with prototype update cf7d574 (multi-service, guest mode)"
description: "Port the ui-prototype changes from commit cf7d574: several services per category, guest mode, per-service provider sessions."
status: done
priority: P1
effort: 45m
tags: [frontend, mobile, react-native]
blockedBy: []
blocks: []
created: 2026-11-13
---

# Sync RN app with prototype update cf7d574

Source of truth: `git diff 6d91241 cf7d574 -- ui-prototype` (app.js, app.css).

## Decisions (user-confirmed)

- News: VnExpress, Tuổi Trẻ (`https://tuoitre.vn/`), Thanh Niên (`https://thanhnien.vn/`) all load the real site in GeckoView `BrowserView`.
- Game: keep **only 2048** (real site). Tic Tac Toe and Memory Match are **not** ported.
- Video (YouTube, Vimeo, Twitch, Dailymotion) and Music (Spotify, SoundCloud, Bandcamp): simulated player with the per-service sample collections from app.js.
- Earlier decisions from `plans/261113-1122-port-ui-prototype/plan.md` still apply.

## Scope

1. Catalog: services per category with detail copy; video/music collections; news URLs.
2. Store: `route.service`, per-service session keys (`cat` for the default service, `cat:service` otherwise), restore over all non-Game service keys, guest mode (`data.guest`, Get started, leave guest, guest account sheet), demo sign-in moved to Demo controls, Game has no provider sessions.
3. Screens: welcome buttons, auth (no demo button), home descriptions and guest copy, category service rows, provider title/session row (hidden for Game), panels.
4. Tests and README.

## Phases

| # | Phase | Owner | Status |
|---|-------|-------|--------|
| 1 | Port changes + tests + README | Codex `gpt-6.1-terra` (tier 1: store contract across modules) | done |
| 2 | Review + emulator check | Claude | done |

## Acceptance criteria

1. `npm run typecheck`, `npm run lint`, `npm test -- --runInBand` pass; Android debug build passes.
2. Jest covers: Get started → guest home; demo sign-in from Demo controls; category lists all services (Game only 2048); Tuổi Trẻ/Thanh Niên render `BrowserView` with their URL; Vimeo shows its own collection; provider sign-in is per service; Game page has no provider row.
3. Copy matches app.js verbatim.
