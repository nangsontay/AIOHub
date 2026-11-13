# Phase 1 foundation API

- `src/theme/tokens.ts`: `colors`, `spacing`, `radii`, `typography`.
- `src/components/icon.tsx`: `Icon({name, size?, color?, strokeWidth?})`, `IconName`.
- `src/components/brand-mark.tsx`: `BrandMark({size?})`.
- `src/components/ui.tsx`: `Button({children?, label?, onPress?, variant?, icon?, iconEnd?, small?, disabled?, accessibilityLabel?, style?})`, `BackLink({label,onPress})`, `BrandHeader({initial?,onAccount?,onDemo,offline?})`, `StateCard({symbol,title,text?,children?})`, `MenuRow({label,icon,onPress})`, `Field({label,error?,...TextInputProps})`, `Notice({children})`, `Spinner()`, `Screen({children,style?})`.
- `src/components/sheet.tsx`: `Sheet({visible,title,onClose,children})`.
- `src/state/catalog.ts`: `Cat`, `cats` (category-to-provider map), `serviceUrls` (News and Game), `demos`, `videos`, `tracks`, `formatTime(seconds)`.
- `src/state/sha256.ts`: `portableSHA256(bytes: Uint8Array): string`, `digest(password,salt): Promise<string>`.
- `src/state/store.tsx`: `AppProvider({children})`, `useApp()`, types `Cat`, `Route`, `PanelName`, `RestoreState`, `FieldErrors`; all state and actions specified in phase 1 are exposed by `useApp()`.

`FieldErrors` uses `email`, `password`, `confirm`, and `auth` optional fields. `outcome` accepts `success`, `expired`, or `unsupported`; `session(cat, device?)` uses `D1`/`D2`; `sheetNotice` holds the transient demo-sheet message from `seedSession()` independently of `notice`. `openAuthPage(page)` closes the panel, clears `notice`, and navigates to welcome, signin, or register. `openRestore()` closes the panel, resets `restoreState`, and navigates to restore. `openService` accepts optional sticky `loading` or `error`; `back()` returns false when the navigation stack is empty. Native storage failures retain in-memory state.

Validation: `npm run typecheck` and `npx eslint src` passed; SHA-256 `abc` matched `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`, and Unicode/replacement vectors matched Node crypto. Installed: `react-native-svg` 15.16.1 and `@react-native-async-storage/async-storage` 3.1.1; both peer dependencies accept any React Native version, [SVG supports RN 0.80+ and Fabric](https://github.com/software-mansion/react-native-svg/blob/main/README.md), and [AsyncStorage v3 supports RN 0.76+](https://github.com/react-native-async-storage/async-storage/blob/main/docs/migration-to-3.md). Native build and device behavior remain for phase 3.
