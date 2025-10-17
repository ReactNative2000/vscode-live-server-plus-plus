# Apps Script receiver (form responses + reconciliation)

This folder contains a minimal Google Apps Script (`Code.gs`) that accepts both the reflection form submissions and reconciliation POSTs.

Steps to use
1. Create a Google Spreadsheet to store responses. Note its spreadsheet ID (from the URL).
2. Open script.google.com → New project, paste the contents of `Code.gs`.
3. Replace `SPREADSHEET_ID` in `Code.gs` with your spreadsheet ID.
4. Deploy → New deployment → Select type: Web app. Set "Execute as" to `Me` and "Who has access" to `Anyone` (or `Anyone, even anonymous` for a public form).
5. Use the deployment URL as the endpoint in the form (replace the Apps Script endpoint in `docs/reflection_form_improved.html` with this URL).

Behavior
- POSTs with JSON or form-encoded fields are accepted.
- Normal form submissions are written to `Responses` sheet.
- If POST payload contains `_type: 'reconciliation'`, it will be written to `Reconciliation` sheet.

Security note
- Anyone with the web app URL can POST data. If you need restricted access, consider:
  - Using a simple secret token in the POST body and validating it in `doPost`.
  - Deploying with access restricted to your domain (G Suite) and using an authenticated flow.
