Project Bible — vscode-live-server-plus-plus

Purpose

This document is the "project bible" for the vscode-live-server-plus-plus repository. It summarizes the architecture, major components, configuration, developer workflows, testing, CI, and recommended next steps. Use it as a single reference for onboarding contributors, debugging, and making safe changes.

Contract (inputs / outputs / success criteria)

- Inputs: Node.js (>=16), npm, optional Docker for containerized runs, environment variables for ORCID and Twilio when those features are used.
- Outputs: A running Express demo server (default PORT 3000), admin UI, demo pages, and scripts for Twilio and testing. Persistent data is stored in SQLite `server/lspp.db`.
- Success criteria: Server boots, /health responds 200, ORCID connect flow produces a 302 to orcid.org, Twilio dry-run prints expected message, Playwright tests (or Node check) pass in CI.

High-level architecture

- server/index.js — Main Express application. Handles demo pages, admin endpoints, Twilio hooks, ORCID connect/callback, and small utilities.
- server/lspp.db — SQLite file; tables: events, orcid_links (added for ORCID), other app tables.
- docs/ — Site content and demo pages including courthouse and hospital examples.
- scripts/ — Helper shell scripts: Twilio sends, start-server-safe, find_and_kill_port, etc.
- test/ and test/playwright/ — E2E tests and quick Node checks to validate redirects and endpoints.
- .github/workflows/ — CI jobs that start the server (on a fallback port in CI) and run the verification checks.

Key files and endpoints

- `server/index.js`:
  - GET /health — health check used by CI.
  - GET /orcid/connect — starts ORCID OAuth by generating state and redirecting to orcid.org/oauth/authorize
  - GET /orcid/callback — handles the authorization code exchange (requires ORCID_CLIENT_SECRET to verify)
  - GET /admin/orcid-links — protected admin JSON listing of stored ORCID links
  - DELETE /admin/orcid-links/:id — admin-only delete for cleanup
  - POST /send — Twilio integration point (scripted via shell scripts for ease)

Configuration and env vars

- Essentials:
  - PORT — port to bind (default 3000). For CI and local fallback we use 3010 where 3000 is blocked.
  - ADMIN_TOKEN — a short bearer token for admin endpoints (or Basic auth supported for legacy flows).

- ORCID (OAuth):
  - ORCID_CLIENT_ID — your ORCID OAuth client ID
  - ORCID_CLIENT_SECRET — secret for exchanging code for an access token (keep secret)
  - ORCID_REDIRECT_URI — must match your ORCID app registration (e.g., https://your-host/orcid/callback)
  - ORCID_ID, ORCID_URL — optional static display fields used in Twilio dry-runs

- Twilio:
  - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, TWILIO_TO — required for live SMS sends

Developer workflows

- Local quick start (no Twilio, no ORCID):
  - npm install
  - PORT=3010 npm start
  - open http://127.0.0.1:3010/health and http://127.0.0.1:3010/orcid/connect

- Full ORCID end-to-end (external registration needed):
  - Register an ORCID OAuth app. Add redirect URI pointing to your server's /orcid/callback.
  - Set ORCID_CLIENT_ID and ORCID_CLIENT_SECRET in the environment (never commit secrets).
  - Start the server and visit /orcid/connect. Approve, then verify that /orcid/callback stores an entry in the `orcid_links` table.

- Twilio dry-run:
  - scripts/send_sms_twilio.sh --dry-run --include-orcid
  - This prints what would be sent and includes ORCID info if ORCID_ID is present.

Testing & CI

- Quick Node check (used in CI): `test/playwright/check_orcid_connect.js` — fetches /orcid/connect and asserts 302 and that the `client_id` and `redirect_uri` are present in the redirect URL.
- Playwright tests: located under `test/playwright/` for richer E2E checks when Playwright is installed.
- GitHub Actions includes `orcid-check.yml` which starts the server on a non-default port (3010) and runs the Node quick check.

Troubleshooting

- Port 3000 occupied by root or another process:
  - Use the scripts in `scripts/` to inspect: `scripts/find_and_kill_port.sh 3000` (may need sudo on the host).
  - Or start with an alternate port: `PORT=3010 npm start` or use `scripts/start-server-safe.sh`.

- ORCID token exchange failures:
  - Ensure ORCID_CLIENT_SECRET is valid and the registered redirect URI exactly matches ORCID_REDIRECT_URI sent in connect.
  - Check logs around the callback for token exchange HTTP responses.

Security notes

- Never commit ORCID_CLIENT_SECRET, TWILIO_AUTH_TOKEN or other secrets. Use repository secrets in CI.
- Admin endpoints are protected by `ADMIN_TOKEN` or Basic auth patterns. Rotate tokens if leaked.

Database & cleanup

- The `orcid_links` table stores id, orcid, access_token (if present) and created timestamp. Use `DELETE FROM orcid_links WHERE id = ?` via admin endpoint to remove entries.
- Backups: `server/lspp.db` can be copied for backup; consider regular dumps if you rely on it in production.

Next steps & suggestions

- Decide whether you want the modified server to run on 3010 permanently for development to avoid conflicts with the root-owned 3000 process — I can change default scripts to prefer 3010.
- If you want the entire KJV text inside the repo, confirm and I'll add the full public-domain KJV (or a specific translation). Currently the repo contains a short KJV excerpt file alongside this project bible.
- Consider adding a `scripts/ci_local_start.sh` wrapper that ensures a free port is used and writes the used port to `.server-port` for other scripts to read.

Change log pointer

- See `CHANGELOG.md` and commit history for details of recent ORCID and Twilio additions.

Contact

- If you want, I can also generate a compact PDF version of this project bible or add it to `README.md` as a short section for new contributors.
