# Stripe reconciliation examples

This page shows quick SQL snippets, CSV column examples, and a recommended step-by-step flow to reconcile Stripe Checkout payments (delivered via webhook) with form submissions and member applications in the project database.

Files & tables involved

- `server/lspp.db` — SQLite database with tables `applications`, `members`, and `payments`.
- `payments` table columns: `id`, `stripe_id`, `amount`, `currency`, `member_id`, `created`.
- `applications` table contains submitted applications (`id`, `name`, `email`, `status`, ...).
- `members` table links a created member back to an application (`application_id`).

Suggested CSV columns when exporting payments from Stripe (or your own records)

- `stripe_id` — the Checkout session or charge id (e.g. `cs_test_...` or `ch_...`).
- `amount` — amount in cents.
- `currency` — currency code (USD).
- `customer_email` — optional, useful to match members by email.
- `metadata_application_id` — optional: include if you passed application_id into Checkout metadata.
- `created` — timestamp (ms since epoch or ISO string).

Quick SQL queries

1) List recent payments

```sql
SELECT * FROM payments ORDER BY created DESC LIMIT 100;
```

2) Find payments with no linked member (need reconciliation)

```sql
SELECT * FROM payments WHERE member_id IS NULL ORDER BY created DESC LIMIT 200;
```

3) Join payments to members and applications (when members are linked)

```sql
SELECT p.id AS payment_id, p.stripe_id, p.amount, p.currency, p.created,
       m.id AS member_id, m.name AS member_name, a.id AS application_id, a.name AS applicant_name
FROM payments p
LEFT JOIN members m ON p.member_id = m.id
LEFT JOIN applications a ON m.application_id = a.id
ORDER BY p.created DESC LIMIT 200;
```

4) Match by email when Stripe provided customer email in metadata

```sql
SELECT p.*, m.id AS member_id, m.email
FROM payments p
LEFT JOIN members m ON m.email = p.email
WHERE p.created > strftime('%s','now','-30 days')*1000
ORDER BY p.created DESC;
```

Note: the `payments` table in this repo does not currently have an `email` column by default; if you store customer_email into metadata and persist it on migration, adapt the query to use the proper column (or join using a temporary staging/import table).

CSV export for reconciliation

- Export `payments` to CSV (example using sqlite3 CLI):

```bash
sqlite3 server/lspp.db -header -csv "SELECT * FROM payments ORDER BY created DESC;" > exports/payments.csv
```

- Export `applications` or `responses` (depending on where you store form data) as CSV and load both into your reconciliation tool (Sheets or `docs/admin_reconcile.html`).

Step-by-step reconcile flow (using admin UI)

1. Export payments from Stripe (or use the server `payments` table export).
2. Export or open form responses (from Google Sheets / CSV export).
3. Open `docs/admin_reconcile.html` and load the form responses CSV or paste JSON.
4. Use the payments CSV or the admin `/admin/payments` endpoint to locate payments and match by name, token, email, and timestamp.
5. For each confirmed match, use the admin `/admin/reconcile` endpoint to set the `member_id` on the `payments` row (the UI will call the endpoint for you).

Automating reconciliation (advanced)

- If you pass `application_id` and `customer_email` into Checkout metadata when creating sessions, webhooks can automatically link payments to applications/members. That is the recommended approach for near-automatic reconciliation.
- If emails are reliable, matching by email is usually the most deterministic approach.
- Store relevant metadata (token, application_id, customer_email) as columns on the `payments` table when persisting webhooks to make SQL reconciliation easier.

Migration note

- If you have a legacy `server/payments.json`, you can run the migration endpoint (`POST /admin/migrate-payments`) or call the server migration helpers to dedupe and insert rows into `payments`.

If you'd like, I can add a small script that exports both `payments` and `applications` to CSV and attempts an automatic fuzzy-match (name + token + timestamp delta) and outputs a candidate reconciliation CSV for review.
