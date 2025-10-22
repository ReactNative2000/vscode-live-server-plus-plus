# Send SMS using Twilio

This repo includes a small helper script to send SMS via Twilio's REST API.

Files added:
- `scripts/send_sms_twilio.sh` — bash script to send a single SMS.

Prerequisites
- A Twilio account (trial accounts can send to verified numbers). Note trial accounts add a prefix to messages.
- Note your Account SID, Auth Token, and a Twilio phone number (the "From" number).

Quick usage

```bash
# positional args
./scripts/send_sms_twilio.sh <ACCOUNT_SID> <AUTH_TOKEN> "+1TWILIO_FROM" "+1TO_NUMBER" "Hello from our app"

# or via env vars
TWILIO_ACCOUNT_SID=ACxxx TWILIO_AUTH_TOKEN=yyy TWILIO_FROM=+1TWILIO_FROM ./scripts/send_sms_twilio.sh +13146197822 "Hello — this is a test"
```

Security
- Don't commit credentials. Use environment variables or a secret manager.
- Twilio will bill for SMS; trial accounts and verified numbers have limits.

If you want, I can add a small server endpoint that reads job files and sends SMS automatically when new files are added to a folder (requires storing credentials securely). Say the word and I'll scaffold it.
