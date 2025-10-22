# Twilio setup and testing

This document explains how to configure Twilio credentials for local development and CI, how to run a dry-run test, and how to perform a controlled live test.

## Environment variables

Set the following environment variables locally (do not commit them):

- `TWILIO_ACCOUNT_SID` — your Twilio account SID
- `TWILIO_AUTH_TOKEN` — your Twilio auth token
- `TWILIO_FROM` — your Twilio phone number (the 'From' number)
- `TWILIO_TO` — the destination number (overrides the repo default)

Example (bash):

```bash
export TWILIO_ACCOUNT_SID='ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
export TWILIO_AUTH_TOKEN='your_auth_token'
export TWILIO_FROM='+1xxxxxxxxxx'
export TWILIO_TO='+1yyyyyyyyyy'
```

## Dry-run

Use dry-run modes to inspect the payload without sending SMS:

```bash
./scripts/send_sms_to_brandon.sh --dry-run "This is a test"
# or
./scripts/twilio_test.sh --dry-run
```

Optional: include a public ORCID or Orchid profile URL in messages and dry-runs by setting:

- `ORCID_URL` — full ORCID URL (e.g. https://orcid.org/0000-0002-1825-0097)
- `ORCID_ID` — shorter identifier (e.g. 0000-0002-1825-0097)

The scripts will include either `ORCID_URL` or `ORCID_ID` in dry-run output and JSON outputs (if `--json` is used).

If you want the ORCID to be appended to *live* messages, pass `--include-orcid` to the helper scripts, for example:

```bash
./scripts/twilio_test.sh --live --include-orcid "Integration test message"
# or
./scripts/send_sms_to_brandon.sh --include-orcid -y "Integration test message"
```

## ORCID OAuth (optional)

If you want users to connect their ORCID to this app, register an application at https://orcid.org/developer-tools and obtain:

- `ORCID_CLIENT_ID`
- `ORCID_CLIENT_SECRET`
- Set the Redirect URI in ORCID to `https://<your-domain>/orcid/callback` (or `http://localhost:3000/orcid/callback` for local testing).

Set these in your environment (or CI secrets) as:

```bash
export ORCID_CLIENT_ID='APP-xxxx'
export ORCID_CLIENT_SECRET='your_secret'
export ORCID_REDIRECT_URI='https://your-domain/orcid/callback'
```

The site includes a "Connect ORCID" button that redirects to `/orcid/connect` on the server; the server will perform the OAuth exchange and persist the ORCID iD.

## Live test (explicit)

When you're ready to perform a controlled live test, use the test helper or the main script with `-y` and `--live` where applicable.

```bash
# using the helper (explicit live)
./scripts/twilio_test.sh --live "Integration test message"

# or using the main script with auto-confirm
./scripts/send_sms_to_brandon.sh -y "Integration test message"
```

## CI

Add the four environment variables as secrets in your CI provider (GitHub Actions secrets named exactly as above). Use a dedicated phone number and narrow triggers when sending SMS from CI (for example: only on release or on-demand runs).

## Safety recommendations

- Prefer dry-run during development.
- Use Twilio test credentials provided by Twilio for safe API-level testing.
- Limit live-sends to specific branches or a manual workflow dispatch in CI.
