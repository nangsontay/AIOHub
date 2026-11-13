# Prototype sync report

- `src/state/catalog.ts` adds service details, descriptions, URLs, and service-specific media collections.
- `src/state/store.tsx` adds persistent guest mode, selected-service navigation and sessions, non-Game restoration, and the Game session notice.
- `App.tsx` and `src/components/ui.tsx` expose the guest menu in the header.
- `src/screens/welcome.tsx`, `auth.tsx`, `home.tsx`, `category.tsx`, `provider.tsx`, `provider-session.tsx`, `web-service.tsx`, `media-player.tsx`, and `panels.tsx` implement guest entry, service selection, service-specific content and provider controls.
- `__tests__/App.test.tsx` updates demo sign-in and exercises guest persistence, service lists and URLs, session isolation, Game behavior, and non-default service restoration.
- `README.md` and `phase-01-foundation-api-261113-1122.md` describe the updated behavior and API.

The requested News and Game site choices replace the prototype's sample articles and extra games. No other intentional deviation was made.

`npm run typecheck`, `npm run lint`, and `npm test -- --runInBand` passed; Jest ran 16 tests in two suites. Android build and device checks were not run as directed; the coordinator owns device verification.
