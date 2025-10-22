# Deploying to Vercel (quick)

This project can be deployed to Vercel for global CDN and serverless endpoints.

1. Create a Vercel account (free tier is sufficient).
2. Import the GitHub repository into Vercel.
3. Add Environment Variables in the Vercel dashboard:

- `STRIPE_SECRET` (for Checkout)
- `STRIPE_WEBHOOK_SECRET` (optional, for webhook verification)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` (if you want SMS features)

1. Deploy. Vercel will serve `docs/` statically and `server/index.js` as serverless functions.

Notes:

- The `vercel.json` config in the repo maps `/create-checkout` and `/webhook` to the serverless handler.
- For local testing, run the server locally first:

```bash
cd server
npm install
STRIPE_SECRET=sk_test_xxx node index.js
```

If you want, I can prepare a one-click deploy badge or help configure DNS for a custom domain.
