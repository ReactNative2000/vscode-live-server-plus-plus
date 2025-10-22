# 2025 Production Launch Runbook

Purpose

This runbook is a concise, actionable checklist for launching the project into production in 2025. It covers pre-deploy checks, environment configuration, webhook setup (Stripe), smoke tests, backup & restore, monitoring, incident rollback, and post-launch tasks.

Keep this document near your deployment console during a release.

Preflight (before any deploy)

- Ensure you have an exact Git commit/branch ready for release (tag or commit SHA). Example:

```bash
git checkout feature/payments-admin
git pull --ff-only origin feature/payments-admin
git rev-parse --short HEAD
```

- Confirm owner/maintainer contact info and make sure Slack/SMS/Telegram/Email addresses for notifications are set in env vars (ADMIN_EMAIL, TELEGRAM_CHAT_ID, TWILIO_TO).
- Make sure secrets are available in your host secret store:
  - STRIPE_SECRET (sk_live_... when ready; use sk_test_... for testing)
  - STRIPE_WEBHOOK_SECRET
  - ADMIN_TOKEN (or ADMIN_USER/Admin_PASS)
  - TWILIO_*, SMTP_* (optional)

- Snapshot current DB & files (local/dev hosts):

```bash
mkdir -p server/exports/backup_$(date +%Y%m%d_%H%M%S)
cp server/lspp.db server/exports/backup_$(date +%Y%m%d_%H%M%S)/
```

Optional: upload backup to S3 or remote storage.

Deploy targets & assumptions

- This runbook assumes a single-node server process running `node server/index.js` behind HTTPS. For static hosting of docs, use GitHub Pages or Vercel and point API endpoints to your server.
- Recommended environment: Ubuntu 22+/systemd or an app platform (Vercel/Heroku/DigitalOcean App Platform). Ensure HTTPS and a domain name are configured.

Environment variables (quick checklist)

- STRIPE_SECRET — Stripe secret key (test/live)
- STRIPE_WEBHOOK_SECRET — from Stripe Dashboard (after registering webhook)
- ADMIN_TOKEN or ADMIN_USER/ADMIN_PASS — admin auth
- SMTP_* — mailer (optional)
- TWILIO_* — SMS (optional)
- TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID — optional notifications

Deployment steps (minimal, Ubuntu/systemd)

1. Pull the desired commit on the server and install deps:

```bash
cd /var/www/lspp
git fetch --all && git checkout <release-commit>
npm ci
```

2. Ensure env vars are set (example using systemd environment file `/etc/lspp.env`):

```ini
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_TOKEN=... etc
```

3. Reload systemd unit (example unit provided in `deploy/prod-systemd.service` if present):

```bash
sudo systemctl daemon-reload
sudo systemctl restart lspp.service
sudo journalctl -u lspp.service -f
```

4. Confirm the process is listening on the expected port and reachable over HTTPS.

Smoke tests (immediately after deploy)

1. Health check

```bash
curl -I https://your-app.example.com/health
# Expect 200 OK or a small status JSON
```

2. Test Checkout creation (requires STRIPE_SECRET)

```bash
curl -X POST https://your-app.example.com/create-checkout \
  -H 'Content-Type: application/json' \
  -d '{"amount":500,"currency":"USD","application_id":"123","customer_email":"tester@example.com"}'
```

Response should include a `url` to open the Stripe Checkout page.

3. Test webhook path via ngrok (local testing) or from Stripe Dashboard (deployed)

- Local:

```bash
ngrok http 3000
# register the ngrok URL in Stripe Dashboard as https://<ngrok-id>.ngrok.io/webhook
```

- Use Stripe's dashboard to send a `checkout.session.completed` test event and confirm the server receives it (check server logs and `payments` table).

4. Verify payment persisted

Use sqlite3 or the admin UI to confirm a new payment row exists:

```bash
sqlite3 server/lspp.db "SELECT * FROM payments ORDER BY created DESC LIMIT 5;"
```

Rollback plan (if something fails)

1. Stop new process and re-start previous release:

```bash
sudo systemctl stop lspp.service
git checkout <previous-commit>
npm ci
sudo systemctl start lspp.service
```

2. Restore DB from the snapshot you took earlier (if needed):

```bash
cp server/exports/backup_YYYYMMDD_HHMMSS/lspp.db server/lspp.db
sudo systemctl restart lspp.service
```

3. Notify stakeholders: use the notification channels to announce rollback and next steps.

Backups & maintenance

- Schedule daily DB backups (cron or systemd timer): compress and copy `server/lspp.db` to export location.
- Example backup script `deploy/backup_lspp.sh` (create and schedule via cron):

```bash
#!/usr/bin/env bash
set -euo pipefail
OUT=server/exports/backup_$(date +%Y%m%d_%H%M%S)
mkdir -p "$OUT"
cp server/lspp.db "$OUT/"
gzip -9 "$OUT/lspp.db"
# optional: aws s3 cp "$OUT/lspp.db.gz" s3://your-bucket/lspp-backups/
```

Monitoring & alerts

- Add a basic `/health` endpoint that returns 200 and checks DB connectivity. (If you want, I can add this small endpoint.)
- Remote logging: consider Papertrail, Logflare, or LogDNA for aggregated logs and retention.
- Error tracking: add Sentry (Node integration) to capture exceptions in production.

Operational checks post-launch (first 48 hours)

- Confirm webhooks are delivered without signature errors (Stripe Dashboard → Webhooks → Delivery attempts).
- Confirm payments are saved to `payments` table and member linking occurs for test cases.
- Monitor logs for errors, high latency, and crashing.

Communications (templates)

- Incident Slack/SMS template:

```
Incident: Production payment webhook errors
Time: $(date -u)
Impact: Stripe webhooks failing to persist payments
Action: Rolling back to previous commit and restoring DB snapshot
Contact: ops@example.com
```

Post-launch tasks

- Replace test Stripe keys with live keys when ready.
- Remove any dev-only logging and ensure log rotation is configured.
- Review admin UIs and enforce Authorization header usage (already recommended in `docs/deploy.md`).

Appendix: Quick commands

- Tail logs

```bash
sudo journalctl -u lspp.service -f
```

- Export recent payments as CSV

```bash
sqlite3 server/lspp.db -header -csv "SELECT * FROM payments ORDER BY created DESC LIMIT 500;" > exports/payments_recent.csv
```

- Manually invoke migration endpoint (admin required)

```bash
curl -X POST -H "Authorization: Bearer ${ADMIN_TOKEN}" https://your-app.example.com/admin/migrate-payments
```

If you'd like, I can:

- Add the `/health` endpoint and a tiny `/metrics` JSON response.
- Add the `deploy/prod-systemd.service` and `deploy/backup_lspp.sh` files and wire a sample cron entry.
- Create `scripts/e2e_stripe_test.sh` to automate ngrok + Stripe test flow.

Files added in this workspace to support the runbook:

- `deploy/prod-systemd.service` — example systemd unit for production
- `Procfile` — simple process declaration for Heroku-like platforms
- `deploy/backup_lspp.sh` — backup + optional S3 upload script
- `scripts/e2e_stripe_test.sh` — ngrok-based end-to-end test helper

---

Status: scaffolded. Next: I can implement the health endpoint and create the systemd/backup scripts if you want to proceed.
