# Docs for Reflection Form

This folder contains an improved, resilient student reflection form: `reflection_form_improved.html`.

Endpoint expectations

- The page will POST JSON by default to the configured Apps Script endpoint.
- If the endpoint rejects JSON (non-OK response), the client will automatically retry using `application/x-www-form-urlencoded` (common for older Apps Script handlers).
- The client also supports offline usage by queueing submissions in `localStorage` and retrying when the browser goes back online.

Local testing

1. From the repository root, run a static server, for example:

```bash
python3 -m http.server 8000
```

2. Open the form in your browser (replace host/port as needed):

```text
http://localhost:8000/docs/reflection_form_improved.html
```

3. To simulate offline behavior:

   - Open DevTools → Network → select "Offline" and submit the form. Submissions will be queued and retried automatically when back online.

Notes

- The client performs basic validation client-side; it's still recommended to validate input on the server.
- Queued submissions are stored under `localStorage` key `reflection_offline_queue_v1`. Clearing site storage will remove queued items.

Payment (optional)

- You can accept optional support payments via Cash App. Send payments to the cashtag: `$brandon314314`.
- The form does not depend on payment — submissions are recorded regardless of payment. Reconcile payments manually against form responses (timestamp + fio/topic).

Admin reconciliation UI

- A lightweight reconciliation UI is available at `docs/admin_reconcile.html`.
- Usage:
   1. Export form responses from Google Sheets as CSV and upload via the CSV uploader, or paste a JSON array of responses.
   2. Mark rows as paid, record amount and transaction id, and save locally or download reconciliation CSV.
   3. Optionally enter an Apps Script endpoint to POST reconciliation rows remotely.

Note: This tool stores reconciliation locally in the browser by default (localStorage). For team-wide reconciliation, provide an Apps Script endpoint that accepts reconciliation POSTs and saves them to a shared sheet.
