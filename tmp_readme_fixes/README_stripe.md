# Stripe Checkout + Webhook (example)

Minimal Express example to create Stripe Checkout sessions and verify webhooks. See `.env.example` for required keys.

Quick start

1. Install dependencies:

```bash
cd docs/stripe
npm install
```

1. Create a `.env` from `.env.example` and set your Stripe keys.

1. Run the server:

```bash
npm start
```

1. Expose a webhook URL (ngrok or host) and configure the webhook secret in `.env`.

Notes

- Do not commit secret keys.
- Use the webhook to forward verified payment metadata (for example the `token`) to your Apps Script or DB.
