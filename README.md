# Cross-Platform Web & Mobile App (Android & iOS)

This application is built as a modern, high-performance Web Application powered by React 19, Vite, TypeScript, and Tailwind CSS, fully enabled for cross-platform deployment on **Android** and **iOS** using **Capacitor**.

---

## 🚀 Features & Platform Support

- 🌐 **Web App**: Built with Vite, React 19, TypeScript, and Tailwind CSS.
- 🤖 **Android Native Compatibility**: Integrated with Capacitor Android native container (`android/`).
- 🍎 **iOS Native Compatibility**: Integrated with Capacitor iOS native container (`ios/`).
- ⚡ **Optimized Build Pipeline**: Code splitting, chunk optimization, lazy loading, and minimal bundle overhead.
- 📦 **GitHub Actions CI/CD**: Automatic multi-platform build workflow generating full file-size downloadable artifacts and Android APK files.

---

## 📱 Mobile Compatibility Overview

The application utilizes `@capacitor/core`, `@capacitor/android`, and `@capacitor/ios` to bridge web features with native mobile runtimes.

- **Viewport & Notch Support**: Configured with `viewport-fit=cover` and mobile-optimized meta tags.
- **Native Project Integration**: Complete native Gradle project for Android and Xcode workspace for iOS.

---

## 🛠️ Getting Started & Installation

### Prerequisites
- Node.js `^20.0.0`
- Java JDK 17 (for Android builds)
- Android Studio & SDK (for local Android builds/emulation)
- macOS & Xcode (for local iOS builds/emulation)

### Installation
```bash
npm install --legacy-peer-deps
```

### Local Development
Run the web development server:
```bash
npm run dev
```

---

## 🏗️ Building for Web and Mobile

### 1. Web Production Build
```bash
npm run build
```
The optimized static bundle will be generated in the `dist/` directory.

### 2. Android Build & APK Generation
To build the web bundle, sync Capacitor assets, and generate an Android APK locally:
```bash
npm run build:android
```
The compiled APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

To open the project in Android Studio:
```bash
npx cap open android
```

### 3. iOS Build
To build the web bundle and sync assets to the iOS project:
```bash
npm run build:ios
```

To open the project in Xcode:
```bash
npx cap open ios
```

---

## ⚙️ GitHub Actions CI/CD & Downloadable Artifacts

The repository includes a GitHub Actions workflow (`.github/workflows/build.yml`) that automatically builds Web, Android, and iOS targets on push, pull request, or manual trigger.

### Automated Builds & Artifacts
When the workflow completes, the following **full file size artifacts** are available for download under the **Actions -> Summary** tab:

| Artifact Name | Content | Format |
|---|---|---|
| `android-apk` | Ready-to-install Android Application Package | `.apk` (`app-debug.apk`) |
| `ios-app` | Native iOS Xcode project & compiled assets | Archive / Directory |
| `web-dist` | Optimized web static assets | Production Build Directory (`dist/`) |

### How to Download Android APK from GitHub
1. Go to the **Actions** tab in the GitHub repository.
2. Select the latest workflow run under **Build Web, Android & iOS Apps**.
3. Scroll down to the **Artifacts** section at the bottom of the summary page.
4. Click on **`android-apk`** to download the `app-debug.apk` directly.
5. Transfer to your Android device and install (allow installation from unknown sources if prompted).

---

## ⚡ Build Optimization Highlights

1. **Rollup Chunk Splitting (`vite.config.ts`)**:
   - `charts-vendor`: Isolated heavy charting components (`recharts`, `d3`).
   - `firebase-vendor`: Separate chunk for Firebase authentication & database SDKs.
   - `pdf-vendor`: Dynamic isolation for heavy document rendering libraries (`jspdf`, `html2canvas`).
   - `editor-vendor`: Isolated rich text editor components (`quill`).
   - `vendor`: Core UI utilities and framework modules.

2. **Mobile Viewport & UX Optimization**:
   - Enabled `viewport-fit=cover` for edge-to-edge rendering on modern smartphones.
   - Dynamic asset cache key hashing for quick load speeds and efficient updating.
   - ES2020 target compilation for broad mobile browser compatibility.

---

## 📜 Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Starts local dev server |
| `npm run build` | Builds optimized web distribution in `dist/` |
| `npm run cap:sync` | Syncs web assets to native android & ios projects |
| `npm run build:android` | Builds web app, syncs Capacitor, and compiles `app-debug.apk` |
| `npm run build:ios` | Builds web app and syncs iOS native project |
