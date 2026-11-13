# AIOHub

React Native + TypeScript application foundation. Android embeds Mozilla GeckoView through a Fabric Native Component; React Native renders the hub and service picker.

The existing `report/` and `ui-prototype/` are preserved reference material. Their Expo/backend/audio proposals and simulated sessions are not implemented by this scaffold.

## Dependencies

- React Native 0.88.1, React 19.3.0, Hermes, New Architecture.
- `react-native-safe-area-context` for safe areas.
- Android build: Kotlin 2.4.21, compile SDK 37.2, target SDK 36, minimum SDK 26 (matching GeckoView requirements).
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

Tap a service to open its real website inside GeckoView; **Hub** closes that browser view and returns home. This creates a new browsing session when opening a service; Gecko's default persistent profile retains website data. There is no per-platform profile isolation yet. The Android app ID is `dev.aiohub.app`, separate from the earlier `dev.aiohub.geckolab` prototype.

All HTTP/HTTPS hosts and ports are permitted, with no host allowlist. Cleartext web navigation is intentionally enabled to preserve this decision. TLS verification uses engine defaults; debugging and website console output are disabled. The browser component accepts web URLs only, not local/executable URI schemes.

## Structure

- `App.tsx`: hub, service selection, compact browser header.
- `src/specs/AIOBrowserNativeComponent.ts`: typed Fabric component specification.
- `src/browser/browser-view.android.tsx`: Android component export.
- `src/browser/browser-view.tsx`: explicit unsupported-browser message for other platforms.
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

Verified on this Mac: TypeScript, ESLint, Jest and the Android Metro bundle pass; the ARM64 debug APK builds successfully at `android/app/build/outputs/apk/debug/app-debug.apk`. No emulator or persistent development server was started.

The retained React Native template uses AGP 9.2.1/Gradle 9.4.1. AGP warns that SDK 37.2 is newer than its tested 37.0 range; the build passes without suppressing that warning. Template/library deprecation warnings also remain. Validate a newer supported AGP combination before release.

The UI test exercises service selection, URL forwarding and returning home, with the native browser mocked. It does not prove website compatibility or authentication.

This is an initialization, not the migrated session-transfer prototype. Encrypted export/import, account sync, popup/window handling, app-prompt suppression, browser back/forward controls, fullscreen integration, background media and DRM are not implemented or validated. Service shortcuts are real URLs, not compatibility guarantees. iOS has not been built. The template release signing configuration is for development; configure private release signing before distribution.

The template's npm audit currently reports 15 findings in CLI/test/lint tooling (9 low, 6 moderate); `npm audit --omit=dev` still includes 4 low CLI/deepmerge findings through npm's dependency classification; `npm audit fix` did not clear them. No forced major downgrades or unverified dependency overrides were applied.

Official references: [React Native setup](https://reactnative.dev/docs/get-started-without-a-framework), [Fabric components](https://reactnative.dev/docs/fabric-native-components-introduction), [GeckoView](https://mozilla.github.io/geckoview/), [Android minor SDK configuration](https://developer.android.com/build#module-level).

## Experiment lessons

[Báo cáo thử nghiệm và bài học triển khai](docs/prototype-experiments-and-lessons.md) — kết quả iOS/Android/GeckoView, lỗi và cách xử lý, giới hạn bằng chứng, cùng các ca cần kiểm chứng cho app hoàn chỉnh.
