# Cross-Platform Web, Android & iOS Application

This repository contains a full-stack, cross-platform application built with React 19, Vite, TypeScript, and Tailwind CSS. It is fully enabled for Web/Desktop, Android, and iOS deployment using [Capacitor](https://capacitorjs.com/).

---

## 🚀 Features & Platforms

- **Web / Desktop**: Optimized SPA powered by Vite and React 19.
- **Android Native App**: Configured via Capacitor with Gradle build capabilities (`android/`).
- **iOS Native App**: Configured via Capacitor for Xcode build targets (`ios/`).
- **Unified Branding**: Multi-platform app icons generated across Web, Desktop, Android mipmaps, and iOS AppIcon sets.
- **Automated CI/CD Workflows**: GitHub Actions workflow generates direct artifact downloads (including full APK builds) on every push and pull request.

---

## 📦 Prerequisites

Ensure you have the following installed locally:

- **Node.js**: v20+ recommended
- **npm**: v10+ (Note: React 19 peer dependencies require `--legacy-peer-deps` flag during installation)
- **Java JDK**: JDK 21 (Required for Capacitor Android Gradle builds)
- **Android Studio / SDK**: Android SDK 34+ for local Android builds
- **Xcode**: Xcode 15+ (macOS only, required for iOS builds)

---

## 🛠️ Getting Started

### 1. Installation

```bash
npm install --legacy-peer-deps
```

### 2. Development Server

Start the local server in development mode:

```bash
npm run dev
```

### 3. Build & Capacitor Sync

To build the production web assets and synchronize them with native Android and iOS projects:

```bash
# Build web app and sync native platforms
npm run cap:build

# Or build specifically for Android
npm run build:android

# Or sync specifically for iOS
npm run build:ios
```

---

## 🎨 App Icon & Asset Generation

App icons for Web, Desktop, Android, and iOS are generated directly from the master logo image (`SUPREME LOGO 03.png`).

To regenerate all platform icon assets at any time:

```bash
python3 /home/jules/self_created_tools/generate_app_icons.py
```

Generated locations:
- **Web/Desktop**: `public/favicon.ico`, `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/logo.png`.
- **Android**: `android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher*.png`.
- **iOS**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-*.png`.

---

## ⚙️ Build Optimization Guide

### Web & Vite Optimizations
- **Code Splitting**: Routes and heavy modules (such as chart libraries and PDF generators) are lazily loaded to minimize initial bundle size.
- **Asset Compression**: Minified JS and CSS bundles output to `dist/` with high gzip compression efficiency.
- **Fast Refresh**: React Vite plugin enables fast module updates during development.

### Native Android Optimizations
- **Gradle Caching**: Gradle daemon and wrapper configurations (`android/gradlew`) optimize incremental build performance.
- **Resource Shrinking & Proguard**: Debug and release builds streamline packaged drawables and mipmap densities.
- **Direct APK Generation**: Built with Gradle `./gradlew assembleDebug` into `android/app/build/outputs/apk/debug/app-debug.apk`.

### Native iOS Optimizations
- **Capacitor Sync**: Native iOS bridge automatically updates `ios/App/App/public` upon `npx cap sync ios`.
- **Xcode Workspace**: Configured to build through `ios/App/App.xcworkspace`.

---

## 🤖 GitHub Actions CI/CD & Artifact Downloads

The included GitHub Actions workflow (`.github/workflows/build.yml`) automates cross-platform verification and artifact creation.

### Workflow Jobs:
1. **Build Web App**: Compiles production web build and publishes `web-dist-build` artifact.
2. **Build Android APK**: Sets up Java 21, syncs Capacitor Android, compiles native APK via Gradle, and publishes `android-app-debug-apk` artifact.
3. **Build iOS Project**: Runs on `macos-latest`, syncs Capacitor iOS, builds simulator project via `xcodebuild`, and publishes `ios-app-workspace` artifact.

### How to Download Artifacts:
1. Go to your GitHub Repository -> **Actions** tab.
2. Select the latest workflow run under **Build Web, Android, and iOS Apps**.
3. Scroll down to the **Artifacts** section at the bottom of the summary page.
4. Download the full file size **`android-app-debug-apk`** to retrieve the direct `.apk` file for testing on Android devices or emulators.
