# Store contract fixes

- `src/state/store.tsx`: Added transient `sheetNotice`, panel cleanup, and auth and restore entry actions.
- `src/screens/welcome.tsx`: Routes auth entries through `openAuthPage`.
- `src/screens/auth.tsx`: Clears stale notices on auth navigation and renders the active notice.
- `src/screens/home.tsx`: Opens restoration through `openRestore`.
- `src/screens/panels.tsx`: Shows sheet feedback at the top and closes the account sheet on restoration entry.
- `plans/reports/phase-01-foundation-api-261113-1122.md`: Documents the new state and actions.

Validation: `npm run typecheck` and `npx eslint App.tsx src` both exited 0. Tests and Android build were assigned to another worker; no device or emulator was started.

Status: DONE
Summary: The three store contracts and their screen callers now follow the prototype.
