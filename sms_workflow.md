# Automated SMS workflow (GitHub Actions)

This repo includes a GitHub Actions workflow that can send a job file as an SMS via Twilio when `docs/job_example.txt` or files under `docs/jobs/` are pushed.

How to enable
1. Add repository secrets (Settings → Secrets → Actions):
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM` (your Twilio number)
   - `TWILIO_TO` (destination number to send job posts to)
2. Push `docs/job_example.txt` or add files under `docs/jobs/`.

Notes
- For security keep secrets in GitHub; do not commit credentials.
- The workflow is conservative: it looks for changed job files and defaults to `docs/job_example.txt` when uncertain.
- If you need per-recipient routing, we can extend the workflow to read a recipients file or use a small server and store multiple numbers in secrets.
