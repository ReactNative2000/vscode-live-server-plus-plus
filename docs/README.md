# Docs for Reflection Form

Short reference for the improved reflection form and related assets.

Files of interest

- `reflection_form_improved.html` — main resilient form (JSON-first POST, form-encoded fallback, offline queue).
- `admin_reconcile.html` — reconciliation UI for matching payments to responses.
- `manifest.webmanifest`, `sw.js`, and `icons/` — PWA assets.
- `request_examples/` — curl/HTTP examples for the Apps Script endpoint.
# Docs for Reflection Form

Short reference for the improved reflection form and related assets.

Files of interest

- `reflection_form_improved.html` — main resilient form (JSON-first POST, form-encoded fallback, offline queue).
- `admin_reconcile.html` — reconciliation UI for matching payments to responses.
- `manifest.webmanifest`, `sw.js`, and `icons/` — PWA assets.
- `request_examples/` — curl/HTTP examples for the Apps Script endpoint.

Quick local test

1. From the repository root run a static server:

```bash
python3 -m http.server 8000
```

2. Open the form in your browser:

```text
http://localhost:8000/docs/reflection_form_improved.html
```

3. To simulate offline behavior, open DevTools → Network → select "Offline" and submit the form. Submissions will be queued and retried automatically when back online.

Notes

- Submissions are queued in `localStorage` under `reflection_offline_queue_v1` when offline.
- The client posts JSON by default and falls back to `application/x-www-form-urlencoded` when necessary.
- The client includes recent local chat messages (if available) under the `chat` field in the payload.

Payments (optional)

- Accept optional support payments via Cash App (cashtag: `$brandon314314`).
- Submissions are recorded regardless of payment. Reconcile payments manually against form responses (timestamp + fio/topic) using `docs/admin_reconcile.html`.

Admin reconciliation UI

1. Export form responses from Google Sheets as CSV and upload via the CSV uploader, or paste a JSON array of responses.
2. Mark rows as paid, record amount and transaction id, and save locally or download a reconciliation CSV.
3. Optionally enter an Apps Script endpoint to POST reconciliation rows remotely.

PWA / iOS install notes

This site includes a Web App Manifest and a basic service worker to enable offline fallback and installability.

- iOS (Safari) limitations: iOS supports web apps added to the Home Screen but has limitations (no push notifications, limited background sync, WebKit-only). For best results generate Apple touch icons and splash images.

Generate icons (example using ImageMagick)

```bash
# from a source PNG (512x512) generate required icons
convert icon-512.png -resize 192x192 docs/icons/icon-192.png
convert icon-512.png -resize 152x152 docs/icons/icon-152.png
convert icon-512.png -resize 167x167 docs/icons/icon-167.png
convert icon-512.png -resize 180x180 docs/icons/icon-180.png
# generate iOS splash sizes (example)
convert icon-512.png -resize 1125x2436 docs/icons/apple-splash-1125x2436.png
convert icon-512.png -resize 1242x2688 docs/icons/apple-splash-1242x2688.png
convert icon-512.png -resize 828x1792 docs/icons/apple-splash-828x1792.png
```

PWA / iOS install notes

This site includes a Web App Manifest and a basic service worker to enable offline fallback and installability.

- iOS (Safari) limitations: iOS supports web apps added to the Home Screen but has limitations (no push notifications, limited background sync, WebKit-only). For best results generate Apple touch icons and splash images.


Generate icons (example using ImageMagick)

```bash
# from a source PNG (512x512) generate required icons
convert icon-512.png -resize 192x192 docs/icons/icon-192.png
convert icon-512.png -resize 152x152 docs/icons/icon-152.png
convert icon-512.png -resize 167x167 docs/icons/icon-167.png
convert icon-512.png -resize 180x180 docs/icons/icon-180.png
# generate iOS splash sizes (example)
convert icon-512.png -resize 1125x2436 docs/icons/apple-splash-1125x2436.png
convert icon-512.png -resize 1242x2688 docs/icons/apple-splash-1242x2688.png
convert icon-512.png -resize 828x1792 docs/icons/apple-splash-828x1792.png
```

Install on iOS (manual)

1. Open the form URL in Safari on an iPhone (HTTPS recommended).
2. Tap Share → Add to Home Screen.
3. The app will open in standalone mode without browser UI.

Android / Desktop

- Chrome/Edge will prompt to "Install" when the site meets PWA criteria (manifest + service worker + served over HTTPS). Use Lighthouse to check installability.

Quick Lighthouse check (optional)

```bash
# run headless Lighthouse (requires Node + Lighthouse)
npx lhci autorun --config=lighthouse-config.json
```
- `reflection_form_improved.html` — the main resilient form (JSON-first POST, form-encoded fallback, offline queue).
- `admin_reconcile.html` — lightweight reconciliation UI for matching payments to responses.
- `manifest.webmanifest`, `sw.js`, and `icons/` — PWA assets.
- `request_examples/` — curl/HTTP examples for testing the Apps Script endpoint.
# Docs for Reflection Form

Short reference for the improved reflection form and related assets.

Files of interest

- `reflection_form_improved.html` — main resilient form (JSON-first POST, form-encoded fallback, offline queue).
- `admin_reconcile.html` — reconciliation UI for matching payments to responses.
- `manifest.webmanifest`, `sw.js`, and `icons/` — PWA assets.
- `request_examples/` — curl/HTTP examples for the Apps Script endpoint.

Quick local test

1. From the repository root run a static server:

```bash
python3 -m http.server 8000
```

2. Open the form in your browser:

```text
http://localhost:8000/docs/reflection_form_improved.html
```

3. To simulate offline behavior, open DevTools → Network → select "Offline" and submit the form. Submissions will be queued and retried automatically when back online.

Notes

- Submissions are queued in `localStorage` under `reflection_offline_queue_v1` when offline.
- The client posts JSON by default and falls back to `application/x-www-form-urlencoded` when necessary.
- The client includes recent local chat messages (if available) under the `chat` field in the payload.

Payments (optional)

- Accept optional support payments via Cash App (cashtag: `$brandon314314`).
- Submissions are recorded regardless of payment. Reconcile payments manually against form responses (timestamp + fio/topic) using `docs/admin_reconcile.html`.

Admin reconciliation UI

1. Export form responses from Google Sheets as CSV and upload via the CSV uploader, or paste a JSON array of responses.
2. Mark rows as paid, record amount and transaction id, and save locally or download a reconciliation CSV.
3. Optionally enter an Apps Script endpoint to POST reconciliation rows remotely.

PWA / iOS install notes

This site includes a Web App Manifest and a basic service worker to enable offline fallback and installability.

- iOS (Safari) limitations: iOS supports web apps added to the Home Screen but has limitations (no push notifications, limited background sync, WebKit-only). For best results generate Apple touch icons and splash images.

Generate icons (example using ImageMagick)

```bash
# from a source PNG (512x512) generate required icons
convert icon-512.png -resize 192x192 docs/icons/icon-192.png
convert icon-512.png -resize 152x152 docs/icons/icon-152.png
convert icon-512.png -resize 167x167 docs/icons/icon-167.png
convert icon-512.png -resize 180x180 docs/icons/icon-180.png
# generate iOS splash sizes (example)
convert icon-512.png -resize 1125x2436 docs/icons/apple-splash-1125x2436.png
convert icon-512.png -resize 1242x2688 docs/icons/apple-splash-1242x2688.png
convert icon-512.png -resize 828x1792 docs/icons/apple-splash-828x1792.png
```

Install on iOS (manual)

1. Open the form URL in Safari on an iPhone (HTTPS recommended).
2. Tap Share → Add to Home Screen.
3. The app will open in standalone mode without browser UI.

Android / Desktop

- Chrome/Edge will prompt to "Install" when the site meets PWA criteria (manifest + service worker + served over HTTPS). Use Lighthouse to check installability.

Quick Lighthouse check (optional)

```bash
# run headless Lighthouse (requires Node + Lighthouse)
npx lhci autorun --config=lighthouse-config.json
```
1. Tap Share → Add to Home Screen.

1. The app will open in standalone mode without browser UI.
