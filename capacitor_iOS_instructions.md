# Capacitor iOS wrapper (quick start)

This document shows how to create a small native wrapper using Capacitor so the web app can be packaged and submitted to the Apple App Store. This must be run on macOS with Xcode installed to build the iOS app.

Prerequisites

- Node.js + npm installed locally.
- Xcode (latest stable) on macOS.
- An Apple Developer Program account (to create bundle ids and provisioning profiles).

Steps (local)

1. From your local clone (not in this Codespace), install Capacitor:

```bash
npm install --save @capacitor/core @capacitor/cli
npx cap init reflection-app com.example.reflection
```

2. Build the web assets and copy them to the native project. If your site is served from `docs/`, you can use a simple copy step:

```bash
# build step (if any). For this repo, ensure docs/ is up to date
cp -r docs www
npx cap add ios
```

3. Open Xcode and configure signing:

```bash
npx cap open ios
```

In Xcode: set the Team for signing, update the bundle id (if needed), configure App Store Connect metadata and screenshots, then build an archive (`Product -> Archive`) and upload to App Store Connect.

Notes

- Capacitor will embed your web assets in a WKWebView. Some web features (service worker) may behave differently inside the native shell.
- For production, configure a proper `start_url` / deep links, and add a privacy policy and any required entitlements.
