# Going global — checklist and notes

This document collects the recommended tasks to make the app ready for international users.

1. Internationalization (i18n)

- Externalize UI strings to `docs/locales/*.json` (we added `en.json` and `es.json`).
- Add locale detection and a language selector (implemented in the reflection form).

1. Localization (l10n)

- Translate marketing pages and store listings; prioritize Spanish and other target languages.
- Use machine + human review for initial rollout.

1. Payments

- Add multi-currency support: Stripe Checkout endpoint `/create-checkout` added to `server/index.js` (requires `STRIPE_SECRET`).
- Keep manual options (Cash App, PayPal) for donors who prefer quick links.

1. Hosting & scale

- Deploy static site on Vercel/Netlify for edge CDN and low latency.
- Use multi-region server or serverless/edge functions for APIs.

1. Realtime & WebRTC

- Use managed TURN services or run `coturn` to ensure connectivity.

1. Legal & tax

- Update privacy policy, cookie consent, and consider VAT/tax (Stripe Tax can help).

1. Distribution

- PWA + Capacitor for app store packaging; prepare localized store listings.

If you'd like, I can:

- Translate additional languages and wire a language dropdown into the site navigation.
- Wire Stripe webhooks to reconcile payments automatically into `docs/admin_reconcile.html`.
- Create a deploy config for Vercel with one-click deploy instructions.

