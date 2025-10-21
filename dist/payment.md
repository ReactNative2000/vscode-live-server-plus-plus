# Payments and reconciliation

This document explains simple payment options for the reflection form and how to reconcile payments with form submissions.

## Quick payment options included in the form

- Cash App: cashtag `$brandon314314` (deep link and QR are generated in the form UI).
- PayPal.me and Venmo quick links are shown as optional alternatives.

- Buy Me a Coffee: recommended for small recurring tips — set up an account at <https://www.buymeacoffee.com> and add the link to your site. Example username used in the form: `brandon314314`.

The form submission itself is independent of payment — the form will save responses even if no payment is recorded. Reconciliation is a manual process unless you wire a server-backed payment flow (e.g. Stripe Checkout + webhooks).

## Recommended reconciliation workflow (manual)

1. Ask payers to include their full name and the game token (if any) in the payment memo/note.
2. Periodically export payments from your Cash App / PayPal / Venmo account (CSV). For Cash App you may need to copy the transaction list from the app or web dashboard.
3. Open the admin reconcile page in the repo: `docs/admin_reconcile.html`. This page accepts a CSV or JSON export and helps you match payments to form rows.
4. Match by full name and token where possible. Use timestamp proximity as a secondary signal.
5. When you confirm a payment, mark the corresponding row as `paid` and add the transaction id (txid) so you have a record.

See `docs/stripe/reconcile_examples.md` for SQL and CSV examples, sample queries to find unmatched payments, and an automated reconciliation plan.

## Automated option (recommended for scale)

If you expect frequent payments, use a real payments provider and server-side webhooks:

- Stripe Checkout or Cash App for Business (if available in your region) can both emit webhooks on successful payments.
- Use a small server (example provided under `docs/stripe/`) to receive webhook events and attach the webhook payload (customer name, metadata, amount, payment id) to your application's database or a spreadsheet.
- When creating a Checkout session, include metadata: `metadata: { fio, token }` so the webhook contains enough context to match the payment to a submission.

Tip: once the server persists payment rows into `server/lspp.db`, you can export `payments` and `applications` as CSV and use `docs/admin_reconcile.html` to visually match rows and call `/admin/reconcile` to link a payment to a member.

## Tips to help users and speed reconciliation

- Encourage payers to paste their full name and the game token into the payment memo.
- If you require payment before submission (the form supports a "Require payment" checkbox), understand this is a UX enforcement only — it cannot verify on-device that the payment actually succeeded unless you implement a server-side verification.
- For stronger verification, integrate Checkout + server webhooks and block submission until the webhook confirms payment (requires backend state and a short wait/redirect loop).

Quick tip: "Buy Me a Coffee" links are great for small supporters — add the link and a button in your header/footer. If you want, I can wire a small analytics event so you can track clicks-to-pay separately in your admin view.

## Security & privacy

- Don't store or transmit sensitive payment details (full card numbers, CVV) in client-side code or spreadsheets.
- For PCI compliance and safety, use a proven payments provider (Stripe, PayPal) for card acceptance.

---

If you'd like I can add an example webhook consumer and show how to attach payment metadata to form submissions. Tell me which provider you prefer (Stripe, PayPal, Cash App for Business) and I will scaffold an example server and webhook handler.
