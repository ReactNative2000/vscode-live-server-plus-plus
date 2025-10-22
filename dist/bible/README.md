This folder contains 'bible' artifacts requested by the user.

Files:
- `project-bible.md` — project-level design and reference for `vscode-live-server-plus-plus`.
- `KJV_excerpt.txt` — short public-domain excerpt from the King James Version (Genesis 1:1-3).
- `God.md` — a neutral, creative description of a deity-like character for use in fiction or documentation.
- `Satan.md` — a literary, neutral description of the figure "Satan" for creative or technical examples (content warning).
 - `Man.md` — a personalized character entry for "The Man" (can be adjusted to include your name or tone).
 - `man.html` — a small profile page for the persona (ReactNative2000).
 - `Vampire.md` — a gothic/mythic character sketch for demos.
 - `vampire.html` — a small demo page for the Vampire persona.
 - `Doctor.md` — a neutral professional doctor persona for demos.

You can also have the persona send playful payments:

curl -X POST http://127.0.0.1:3010/admin/pay-from/man -H "Authorization: Bearer $ADMIN_TOKEN" -d "amount=777"

Admin UI for Man profile

Start the server with an admin token and open the admin page (will prompt for token):

PORT=3010 ADMIN_TOKEN=testtoken npm start
Open: http://127.0.0.1:3010/admin/man.html

The UI allows editing the bio and uploading a profile picture.

If you asked for a different translation or a full public-domain text, reply with which one and I'll add it.

Programmatic access

You can fetch the created artifacts via the server endpoints (server must be running). Example:

curl -sS http://127.0.0.1:3010/character/god | jq -r '.name'
curl -sS http://127.0.0.1:3010/character/satan | jq -r '.name'

If your server is running on a different port, set `TEST_BASE_URL` and use the test scripts under `test/playwright/` to validate.

Playful payments API

You can record a playful payment from `god` or `satan` (admin-only). Example:

curl -X POST http://127.0.0.1:3010/admin/pay-from/god -H "Authorization: Bearer $ADMIN_TOKEN" -d "amount=1000"

curl -X POST http://127.0.0.1:3010/admin/pay-from/satan -H "Authorization: Bearer $ADMIN_TOKEN" -d "amount=2500"

These create rows in the `payments` table with a synthetic txn id like `god-<timestamp>` or `satan-<timestamp>` and will trigger the same notifications as manual cashapp recording if Twilio/Telegram are configured.

Finance endpoints

Schedule a gift (admin):
curl -X POST http://127.0.0.1:3010/admin/schedule-gift -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"who":"god","amount":500,"run_at":<ms since epoch>}'

Refund a payment (admin):
curl -X POST http://127.0.0.1:3010/admin/refund/<payment_id> -H "Authorization: Bearer $ADMIN_TOKEN"

Export ledger CSV (admin):
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://127.0.0.1:3010/admin/ledger.csv -o ledger.csv
