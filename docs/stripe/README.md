# Stripe Checkout + Webhook example

This folder contains a minimal example Express server that creates Stripe Checkout sessions and verifies webhook events. Use this as a reference only; do not commit secret keys.

## Files


## Quick setup

1. Install dependencies:

```bash
cd docs/stripe
npm install
```

1. Create a `.env` file from `.env.example` and set your Stripe keys.

1. Run the example locally:

```bash
npm start
```

1. Configure a Stripe webhook pointing to your server and set the webhook secret in `.env`.

## Security note

# Stripe Checkout + Webhook example

This folder contains a minimal example Express server that creates Stripe Checkout sessions and verifies webhook events. It's a scaffold to show how you can implement a server-side verified payment flow and then persist reflections only after the payment is confirmed.

## Files

- `server.js` — example Express server that creates a Stripe Checkout session and handles a webhook for payment confirmation.
- `package.json` — dependencies for the example.
- `.env.example` — environment variable examples (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET).

## Setup

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

## Notes

- This example logs received events and shows where to forward verified payments to your Apps Script endpoint. Do NOT commit your secret keys into the repository.
- For production, host the server on a secure host and ensure the `success_url` and `cancel_url` are correct.

## Security

- Never commit real Stripe secret keys to source control. Use environment variables or a secrets manager.
# Stripe Checkout scaffold

This folder contains a minimal scaffold demonstrating how to use Stripe Checkout and a webhook to process payments server-side. It's a reference implementation and is not deployed from this repository.

Files

- `server.js` — example Express server that creates a Stripe Checkout session and handles a webhook for payment confirmation.
- `package.json` — dependencies for the example.
- `.env.example` — environment variable examples (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET).

Notes

- To deploy this example, host `server.js` on a secure server (HTTPS) and configure your Stripe webhook endpoint to the public URL.
- Use the provided `.env.example` to set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in a real deployment.
- The example shows how to verify webhook signatures and forward verified payment metadata to another endpoint (for example, the Apps Script endpoint used by the reflection form).

Security

- Never commit real Stripe secret keys to source control. Use environment variables or a secrets manager.
# Stripe Checkout + Webhook example

Minimal Express example to create Stripe Checkout sessions and verify webhooks. See `.env.example` for required keys.
# Stripe Checkout + Webhook example

This folder contains a minimal example Express server that creates Stripe Checkout sessions and verifies webhook events. It's a scaffold to show how you can implement a server-side verified payment flow and then persist reflections only after the payment is confirmed.

Setup

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

Important

- This example logs received events and shows where to forward verified payments to your Apps Script endpoint. Do NOT commit your secret keys into the repository.
- For production, host the server on a secure host and ensure the success_url and cancel_url are correct.
# Stripe Checkout + Webhook example

This folder contains a minimal example Express server that creates Stripe Checkout sessions and verifies webhook events. It's a scaffold to show how you can implement a server-side verified payment flow and then persist reflections only after the payment is confirmed.

Setup

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

Important

- This example logs received events and shows where to forward verified payments to your Apps Script endpoint. Do NOT commit your secret keys into the repository.
- For production, host the server on a secure host and ensure the success_url and cancel_url are correct.
# Stripe Checkout + Webhook example

This folder contains a minimal example Express server that creates Stripe Checkout sessions and verifies webhook events. It's a scaffold to show how you can implement a server-side verified payment flow and then persist reflections only after the payment is confirmed.

Setup

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

Important

- This example logs received events and shows where to forward verified payments to your Apps Script endpoint. Do NOT commit your secret keys into the repository.
- For production, host the server on a secure host and ensure the success_url and cancel_url are correct.
