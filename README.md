# AIOHub

React Native + TypeScript media hub. The UI prototype (welcome → sign in/register → home → category → service, account and demo-control sheets, simulated Device 2 restoration) is ported as the app's screens. Android embeds Mozilla GeckoView through a Fabric Native Component for the News and Game services.

The existing `report/` and `ui-prototype/` are preserved reference material. Their Expo/backend/audio proposals are not implemented by this app.

## Dependencies

- React Native 0.88.1, React 19.3.0, Hermes, New Architecture.
- `react-native-safe-area-context` for safe areas.
- `react-native-svg` 15.16.1 for icons and the logo; `@react-native-async-storage/async-storage` 3.1.1 for persistence (accounts, sessions, demo state).
- Android: `org.mozilla.geckoview:geckoview:160.0.20261104181552` from Mozilla Maven, pinned in `android/app/build.gradle`.
- TypeScript, ESLint, Jest, React Native CLI and Codegen from the official template; npm versions are locked in `package-lock.json`.

No third-party GeckoView React Native wrapper is required. Gecko executes website JavaScript; Hermes executes the app's React Native JavaScript.

## Run Android

Requires Node matching `package.json`, JDK 17 or later, Android SDK Platform 37.2, Build Tools 37.0.0, NDK 27.1.12297006, and an Android emulator or USB device (API 26+).

```sh
cd ~/AIOHub
npm ci
npm start
```

In a second terminal:

```sh
cd ~/AIOHub
npm run android
```

Set `ANDROID_HOME` to your SDK directory or put `sdk.dir=/absolute/path/to/Android/sdk` in the ignored `android/local.properties`. Set `JAVA_HOME` if Gradle cannot find a compatible JDK. Open `android/` in Android Studio for native development. Metro uses port 8081.

The app supports guest browsing, local account registration and sign-in, and demo sign-in via **Demo controls → Use selected demo account**. Video offers YouTube, Vimeo, Twitch, and Dailymotion; Music offers Spotify, SoundCloud, and Bandcamp. Each uses its own simulated media collection. News opens VnExpress, Tuổi Trẻ, or Thanh Niên in GeckoView, and Game opens the real 2048 site. Game has no provider session. The prototype's `<select>` menus became button groups.

Demo controls also provide offline mode, screen-state previews, Device 2, sample Device 1 sessions, and demo reset. Signed-in users on Device 2 can simulate restoring provider sessions from Home or the account sheet. Sessions are stored per service, and the default service retains its existing session key. Gecko's default persistent profile retains website data; there is no per-platform profile isolation yet. The Android app ID is `dev.aiohub.app`, separate from the earlier `dev.aiohub.geckolab` prototype.

## Structure

- `App.tsx`: router and shell — brand header (account, demo controls, offline banner) over the current screen.
- `src/screens/`: `welcome`, `auth` (sign in/register), `home` (category tiles), `category` (service list), `restore` (Device 2 session restore), `panels` (demo/account/provider sheets), `provider` (service frame), `web-service` (browser host), `media-player` (simulated player).
- `src/state/`: `store.tsx` (app state, actions, persistence), `catalog.ts` (categories, services, URLs, demo accounts, samples), `sha256.ts` (portable SHA-256 used for salted password hashes).
- `src/components/`: UI primitives (`Button`, `Field`, `Sheet`, `StateCard`, …), `icon.tsx`, `brand-mark.tsx`.
- `src/theme/`: design tokens (colours, spacing, radii, typography).
- `src/browser/`, `src/specs/`: GeckoView `BrowserView` Fabric component and its typed specification.
- `android/app/src/main/java/dev/aiohub/app/browser/`: shared Gecko runtime, view/session lifecycle, view manager and package.
- `ios/`: generated native shell; GeckoView is Android-only. WebKit integration and CocoaPods installation are pending.

## Checks

```sh
npm run typecheck
npm run lint
npm test -- --runInBand
cd android
./gradlew --no-daemon :app:assembleDebug -PreactNativeArchitectures=arm64-v8a
```

Verified on this Mac (2026-11-13): TypeScript, ESLint and the Jest suite pass, and the ARM64 debug APK builds successfully at `android/app/build/outputs/apk/debug/app-debug.apk`. No emulator or persistent development server was started.

The retained React Native template uses AGP 9.2.1/Gradle 9.4.1. AGP warns that SDK 37.2 is newer than its tested 37.0 range; the build passes without suppressing that warning. Template/library deprecation warnings also remain. Validate a newer supported AGP combination before release.

The build pins `AsyncStorage_kspVersion=2.3.12` in `android/gradle.properties`. async-storage 3.1.1 chooses its KSP plugin by Kotlin version, has no entry for the template's Kotlin 2.4.21, and its fallback (KSP 2.1.0-1.0.28) calls a `KotlinCompile` API removed in the Kotlin Gradle plugin 2.4.21; KSP 2.3.x is version-decoupled and resolves this.

The Jest suite (`__tests__/App.test.tsx`, `__tests__/sha256.test.ts`) drives the UI through accessibility labels and text: demo sign-in, the four category tiles, News opening VnExpress and Game opening play2048.co in the mocked browser after the 450 ms load, the simulated Video/Music players with playback progress, register/sign-in/logout with a local account, the wrong-password and empty-field validation messages, email with no local part rejected on register, the provider account row below the News browser and its absence for Game, offline provider pages (toggled offline on a ready page and via simulated Android hardware Back), the Device 2 restore flow ending with the Device 1 provider identity, form state cleared when starting fresh on Device 2, and the SHA-256 digest. The browser is mocked; it does not prove website compatibility or real provider authentication.

This is a UI prototype port, not the migrated session-transfer product. Real provider auth, encrypted export/import, account sync, popup/window handling, app-prompt suppression, browser back/forward controls, fullscreen integration, background media and DRM are not implemented or validated. Service shortcuts are real URLs, not compatibility guarantees. iOS has not been built. The template release signing configuration is for development; configure private release signing before distribution.

The template's npm audit currently reports 15 findings in CLI/test/lint tooling (9 low, 6 moderate); `npm audit --omit=dev` still includes 4 low CLI/deepmerge findings through npm's dependency classification; `npm audit fix` did not clear them. No forced major downgrades or unverified dependency overrides were applied.

Official references: [React Native setup](https://reactnative.dev/docs/get-started-without-a-framework), [Fabric components](https://reactnative.dev/docs/fabric-native-components-introduction), [GeckoView](https://mozilla.github.io/geckoview/), [Android minor SDK configuration](https://developer.android.com/build#module-level).

## Experiment lessons

[Báo cáo thử nghiệm và bài học triển khai](docs/prototype-experiments-and-lessons.md) — kết quả iOS/Android/GeckoView, lỗi và cách xử lý, giới hạn bằng chứng, cùng các ca cần kiểm chứng cho app hoàn chỉnh.
