# Docs for Reflection Form

This folder contains the resilient reflection form, PWA assets, admin reconciliation UI, and examples.

Notable files

- `reflection_form_improved.html` — the main resilient form (JSON-first POST, form-encoded fallback, offline queue).
- `admin_reconcile.html` — reconciliation UI for matching payments to responses.
- `manifest.webmanifest`, `sw.js`, `icons/` — PWA assets.
- `request_examples/` — curl / REST client examples.

Quick local test

```bash
python3 -m http.server 8000
# then open http://localhost:8000/docs/reflection_form_improved.html
```
