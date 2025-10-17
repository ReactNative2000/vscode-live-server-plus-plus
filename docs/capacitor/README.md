Capacitor wrapper
=================

This folder contains instructions to wrap the `docs/reflection_form_improved.html` page in a Capacitor native app. The real native build must be done on a Mac with Xcode.

Quick scaffold steps (run on your development machine):

1. Create a directory for the web build. We'll use `www/` for Capacitor to serve.

2. If you want to bundle the docs site into the app, copy the built HTML into `www/`:

```bash
mkdir -p www
cp -r ../reflection_form_improved.html ../icons ../manifest.webmanifest www/
```

3. Initialize Capacitor (run on your machine):

```bash
npm install @capacitor/core @capacitor/cli --save
npx cap init lspp-app com.example.lspp "Live Server PWA"
# If your web assets are in `www/` and you're in the project root, ensure capacitor.config.json has "webDir": "www"
npx cap add ios
npx cap open ios
```

4. In Xcode: set your team & signing, then build and run on a device. Upload to TestFlight to distribute.

Notes
-----
- Capacitor gives you access to native APIs if you need them via plugins.
- You must run the native build and signing on macOS with Xcode.
- After changing web assets, run `npx cap copy ios` to update the native project.
