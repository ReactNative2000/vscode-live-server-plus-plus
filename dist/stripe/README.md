# Stripe scaffold — notes

This folder contains a minimal Node/Express scaffold used during development to create Stripe Checkout sessions and receive webhooks. It's intentionally small and not production hardened.

Quick start (local)

1. Copy `.env.example` to `.env` and set `STRIPE_SECRET` (and `STRIPE_WEBHOOK_SECRET` if you plan to verify webhooks).
2. Install dependencies and run the server:

```bash
cd docs/stripe
npm ci
node server.js
```

3. Use the front-end `startCheckout(amountCents)` helper in `reflection_form_improved.html` which calls your `/create-checkout` endpoint.

Testing webhooks locally

- Use a tunnel like `ngrok http 3000` and configure the webhook endpoint in the Stripe dashboard. Copy the webhook signing secret to `.env`.

Production notes

- Use the official Stripe SDK and verify webhook signatures using `STRIPE_WEBHOOK_SECRET`.
- Persist payments to a DB instead of JSON files; rotate keys and restrict access to sensitive endpoints.
# Stripe Checkout + Webhook example

Minimal Express example to create Stripe Checkout sessions and verify webhooks. Use this as a reference only; do not commit secret keys.

Files

- `server.js` — example Express server that creates a Stripe Checkout session and handles a webhook for payment confirmation.
- `package.json` — dependencies for the example.
- `.env.example` — environment variable examples (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET).

Quick setup

1. Install dependencies:

```bash
cd docs/stripe
npm install
```

1. Create a `.env` file using `.env.example` and fill in your Stripe keys:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUCCESS_URL=https://your-site.example/success
CANCEL_URL=https://your-site.example/cancel
```

1. Run the server locally:

```bash
npm start
```

1. Create a webhook endpoint in the Stripe dashboard pointing to `https://your-ngrok-or-host/webhook` and copy the webhook secret into `.env`.

Notes

- This example logs received events and shows where to forward verified payments to your Apps Script endpoint. Do NOT commit your secret keys into the repository.
- For production, host the server on a secure host and ensure the `success_url` and `cancel_url` are correct.

Security

- Never commit real Stripe secret keys to source control. Use environment variables or a secrets manager.
# Stripe Checkout + Webhook example

This folder contains a minimal example Express server that creates Stripe Checkout sessions and verifies webhook events. Use this as a reference only; do not commit secret keys.

## Files


## Quick setup

1. Install dependencies:

```bash
cd docs/stripe
npm install
```
# Stripe Checkout + Webhook example

Minimal Express example to create Stripe Checkout sessions and verify webhooks. Use this as a reference only; do not commit secret keys.

Files

- `server.js` — example Express server that creates a Stripe Checkout session and handles a webhook for payment confirmation.
- `package.json` — dependencies for the example.
- `.env.example` — environment variable examples (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET).

Quick setup

1. Install dependencies:

```bash
cd docs/stripe
npm install
```

2. Create a `.env` file using `.env.example` and fill in your Stripe keys:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUCCESS_URL=https://your-site.example/success
CANCEL_URL=https://your-site.example/cancel
```

3. Run the server locally:

```bash
npm start
```

4. Create a webhook endpoint in the Stripe dashboard pointing to `https://your-ngrok-or-host/webhook` and copy the webhook secret into `.env`.

Notes

- This example logs received events and shows where to forward verified payments to your Apps Script endpoint. Do NOT commit your secret keys into the repository.
- For production, host the server on a secure host and ensure the `success_url` and `cancel_url` are correct.

Security

- Never commit real Stripe secret keys to source control. Use environment variables or a secrets manager.
npm start
