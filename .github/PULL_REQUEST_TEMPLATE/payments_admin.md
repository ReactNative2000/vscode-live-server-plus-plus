Summary
-------
This PR adds manual Cash App payment recording, automated migration and deduplication of payments, CSV export of payments and members, and admin UI to manage migration and manual records.

What changed
------------
- Server: `server/index.js` — migration, dedupe, auto-migration, manual `/admin/record-cashapp` endpoint, CSV exports.
- Docs: `docs/admin_dashboard.html` — admin UI with manual Cash App form.
- `.gitignore` updated to ignore runtime artifacts.

Checklist
---------
- [ ] Server starts without syntax errors (node --check server/index.js)
- [ ] Admin endpoints require `x-admin-token` or Basic auth
- [ ] Migration dedupes by `stripe_id` and exports CSVs to `server/exports/`
- [ ] Manual Cash App form records payments and writes to `tracks.json`
- [ ] Add GH secrets for TWILIO and TELEGRAM (optional for notifications)
- [ ] Add unique DB index on `payments.stripe_id` (index created by migration code)

Notes
-----
- The environment should set `ADMIN_TOKEN` (or `ADMIN_USER`/`ADMIN_PASS`) for admin endpoints.
- For automated PR creation/merge, set `GH_TOKEN` in environment with repo perms.

Testing
-------
1. Start server: `ADMIN_TOKEN=devtoken PORT=3000 node server/index.js`
2. POST to `/admin/migrate-payments` with `x-admin-token: devtoken` to run migration.
3. POST to `/admin/record-cashapp` to create manual records.
4. Verify `server/exports/payments.csv` and `server/exports/members.csv` exist.

