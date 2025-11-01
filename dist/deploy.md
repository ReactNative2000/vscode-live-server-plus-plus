# Deploying the server and registering Stripe webhooks

This document explains how to deploy the server in this repository, configure environment variables, and register Stripe webhooks so Checkout events persist into the SQLite database and show up in the admin UI.

Two recommended deployment approaches are shown: Vercel (fast for static + serverless) and a simple Node host (Ubuntu VM / Heroku / Docker). Use whichever matches your hosting.

## Required environment variables

Set these in your hosting provider's dashboard or export them into the environment before running the server.

- STRIPE_SECRET — your Stripe secret key (starts with `sk_test_` for test mode).
- STRIPE_WEBHOOK_SECRET — the webhook signing secret (recommended). If omitted, the server will accept webhooks without signature verification (less secure).
- ADMIN_TOKEN — a simple admin token that admin pages can use for quick auth (or set ADMIN_USER and ADMIN_PASS).
- ADMIN_USER and ADMIN_PASS — alternative Basic auth credentials for admin endpoints (optional).
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM — optional, for SMS notifications.
- TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID — optional, for Telegram notifications.
- SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_SECURE — optional, for nodemailer admin emails.

Notes:
- Use test Stripe keys (`sk_test_...`) while testing. Use live keys only in production.
- Ensure your host is reachable over HTTPS when registering Stripe webhooks.

## Deploying to Vercel (recommended for docs + simple serverless mapping)

1. Install Vercel CLI (optional) and push this repo to GitHub.

2. In the Vercel project settings, add the environment variables listed above (use test values during testing).

3. Vercel can route `/create-checkout` and `/webhook` to the server handler. The repository includes `vercel.json` mapping for convenience. Ensure your `api` or server handler is using `server/index.js`.

4. Deploy and get your project URL (for example: `https://your-app.vercel.app`).

5. Register Stripe webhook in the Stripe Dashboard:
   - Go to Developers → Webhooks → Add endpoint.
   - Set the endpoint URL to `https://your-app.vercel.app/webhook`.
   - Subscribe to at least `checkout.session.completed` and `charge.succeeded` (optional).
   - After creating the endpoint, copy the signing secret and paste it into Vercel's env var `STRIPE_WEBHOOK_SECRET`.

## Deploying to a VPS / Heroku / Docker

On a Ubuntu VM or similar:

1. Clone the repo and install dependencies:

```bash
git clone <repo>
cd vscode-live-server-plus-plus
npm install
```

2. Set environment variables in the shell or systemd unit (example):

```bash
export STRIPE_SECRET=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
export ADMIN_TOKEN=your_admin_token_here
# optional: TWILIO_*, SMTP_*, TELEGRAM_*
```

3. Start the server (development):

```bash
node server/index.js
```

For production, run under a process manager (pm2, systemd) or in Docker with proper secrets.

### Heroku notes

- Use Heroku config vars (Dashboard → Settings → Reveal Config Vars) to set the env vars.
- Add a Procfile that runs `node server/index.js` if needed.

## Registering the Stripe webhook (detailed)

1. In the Stripe Dashboard, under Developer → Webhooks, create a new endpoint with your server URL plus `/webhook`.

2. Subscribe to the relevant events. Minimum recommended:
   - `checkout.session.completed`
   - `payment_intent.succeeded` (if you use Payment Intents directly)
   - `charge.succeeded`

3. After creation, copy the `Signing secret` and set it in your host as `STRIPE_WEBHOOK_SECRET`.

4. When Stripe sends an event, the server will verify the signature (if the signing secret is set) and on `checkout.session.completed` will persist a payment row in `server/lspp.db` and notify admins if configured.

## Testing end-to-end (Stripe test mode)

1. Ensure `STRIPE_SECRET` is a test key (sk_test_...).
2. Deploy or run the server locally and ensure it's reachable from Stripe. For local testing, use a tunnel (ngrok) and register that URL as webhook.
   - Example: `ngrok http 3000` and set the webhook to `https://<ngrok-id>.ngrok.io/webhook`.

3. From the reflection page, fill in name/email/token and click the client-side Checkout button (or call `startCheckoutFromForm(500)` in the console to start a $5.00 test payment).

4. Complete the payment in Stripe test mode (use the Stripe test card 4242 4242 4242 4242, any future date, any CVC).

5. After completing payment, check the server logs and the admin UI at `/admin/payments` (use the Authorization header to authenticate). You should see a new payment record persisted in `server/lspp.db`.

6. If you used ngrok, you can also inspect webhook deliveries in the Stripe Dashboard → Webhooks → Delivery attempts.

## Troubleshooting

- If webhooks don't appear to be processed, check:
  - `STRIPE_WEBHOOK_SECRET` matches the secret Stripe shows after creating the endpoint.
  - Your server is reachable and not blocking POST requests to `/webhook`.
  - Server logs show the received events or signature verification failures.

- If checkout session creation fails, enable server logs and ensure `STRIPE_SECRET` is set and valid.

## Security notes

- Use HTTPS for your server when registering webhooks and handling payment flows.
- Avoid sharing `ADMIN_TOKEN`, `STRIPE_SECRET` or webhook secret publicly. Use your host's secret store.
- Admin UIs and scripts should use the `Authorization` header instead of querystring tokens. Examples are below.

Examples (Authorization header)

```bash
# curl: fetch payments using Bearer token
curl -H "Authorization: Bearer ${ADMIN_TOKEN}" https://your-app.example.com/admin/payments

# curl: download payments CSV
curl -H "Authorization: Bearer ${ADMIN_TOKEN}" -o payments.csv https://your-app.example.com/admin/export/payments.csv
```

```js
// browser fetch: include Authorization header
const token = 'paste-your-admin-token-here';
const res = await fetch('/admin/payments', { headers: { 'Authorization': 'Bearer ' + token } });
const j = await res.json();
```

Local testing with ngrok

- If you're running the server locally (port 3000) and want Stripe to reach your `/webhook`, run:

```bash
ngrok http 3000
```

- In the Stripe Dashboard, register the ngrok URL (for example `https://<id>.ngrok.io/webhook`) as the webhook endpoint. Copy the signing secret and set it as `STRIPE_WEBHOOK_SECRET` in your local environment.

Note: ngrok URLs are ephemeral — when the tunnel restarts you'll need to update the webhook endpoint and signing secret if a new tunnel is created.

## Next steps after deployment

- Run a few test payments and reconcile them with the admin UI.
- Transfer any legacy `server/payments.json` entries into SQLite using the migration endpoint or scripts in `server/index.js`.
- Replace test Stripe keys with live keys when ready.

---

If you want, I can:
- Create a `systemd` unit or `Procfile` for production runs.
- Add a short `ngrok`/local-tunnel guide and example commands.
- Update admin UIs to use Authorization headers instead of query strings (recommended next step).
