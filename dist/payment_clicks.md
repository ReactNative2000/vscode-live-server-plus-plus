# Payment click tracking

Clicks on payment links (Cash App, Buy Me a Coffee, PayPal, Venmo) are recorded locally and POSTed to the server when available.

Where events are stored

- Local browser: `localStorage` key `lspp_payment_clicks_v1` (useful when offline).
- Server: `server/tracks.json` — the Express `/track` endpoint appends events here.

Event shape

```json
{ "provider": "cashapp|bmac|paypal|venmo", "ts": 1690000000000, "path": "/docs/reflection_form_improved.html" }
```

How to view events

1. Run the server: (from project root)

```bash
cd server
npm install
node index.js
```

1. Open `server/tracks.json` to see accumulated events (JSON array). Example:

```bash
cat server/tracks.json | jq .
```

Privacy note

- Events only contain provider and timestamp — no personal data is collected. If you plan to collect more, update your privacy notice and get consent.
