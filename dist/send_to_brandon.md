## Sending messages to Brandon Shelton

This document explains how to send an SMS and a Telegram message to +1 314-619-7822 (Brandon Shelton) using the repository's CI workflow or local scripts.

Important: only message this number if you have permission to contact the person.

1) Add repository secrets (GitHub)

Go to Settings → Secrets → Actions and add the following:

- `TWILIO_ACCOUNT_SID` — your Twilio account SID
- `TWILIO_AUTH_TOKEN` — your Twilio auth token
- `TWILIO_FROM` — the Twilio phone number to send from (E.164 format, e.g. +12345678901)
- `TWILIO_TO` — +13146197822
- `TELEGRAM_BOT_TOKEN` — your Telegram bot token (optional)
- `TELEGRAM_CHAT_ID` — numeric chat id for Telegram (optional)

2) Run the workflow from Actions

Open Actions → select `Notify Brandon (manual)` → Run workflow. Enter your message.

3) Local test commands

SMS (local):

```bash
TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM=+12345678901 \
./scripts/send_sms_twilio.sh +13146197822 "Hello Brandon — this is a test from the repo."
```

Telegram (local):

```bash
TELEGRAM_BOT_TOKEN="123456789:ABC..." TELEGRAM_CHAT_ID="<CHAT_ID>" \
./scripts/send_telegram_manual.sh "Hello Brandon — this is a test from the repo."
```

4) Troubleshooting

- Twilio: check the Twilio Console for delivery errors and for regional restrictions.
- Telegram: ensure the bot has been started by the user or is an admin of the channel/group so you can message it.
