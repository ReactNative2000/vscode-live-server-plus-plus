PWA tools
=========

This small helper uses Jimp to generate PNG icons and iOS splash images from `docs/icons/icon-512.png`.

Usage:

```bash
cd docs/pwa
npm install
npm run generate-icons
```

It will write resized icons into `docs/icons/`.

Capacitor / iOS notes
---------------------

If you decide to publish to the App Store, the recommended path is to wrap the web app with Capacitor (recommended) or create a native Xcode app with a `WKWebView`.

High-level steps for Capacitor:

1. On a machine with Node and a Mac with Xcode, run:

```bash
npm install @capacitor/core @capacitor/cli --save
npx cap init lspp-app com.example.lspp "ReactNative2000"
# Make sure your built site is in `www/` or change capacitor.config.json
npx cap add ios
npx cap open ios
```

2. In Xcode: set signing team, provisioning profile, and build.

Xcode WKWebView template
------------------------

Create a new iOS project in Xcode and add a `WKWebView` to the main view controller that loads your `https://` hosted URL or local bundled `index.html`.

App Store checklist
-------------------

- Apple Developer account
- App ID, provisioning profile, and Apple Pay setup (if used)
- App Store Connect listing, privacy policy, app screenshots, and icons
- Test on device and upload via TestFlight then submit for review
