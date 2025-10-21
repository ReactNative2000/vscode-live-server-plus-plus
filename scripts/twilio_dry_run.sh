#!/usr/bin/env bash
# Simple dry-run helper for Twilio payloads — prints what would be sent without making network calls.
set -euo pipefail
TO="${TWILIO_TO:-+13146197822}"
MSG="${1:-Hello from repo dry-run}"

cat <<EOF
DRY-RUN Twilio payload
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID:-}
TWILIO_FROM=${TWILIO_FROM:-}
TWILIO_TO=${TO}
Body=${MSG}
EOF
