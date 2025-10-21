#!/usr/bin/env bash
# Small helper to test Twilio credentials using Twilio's test credentials or real ones if provided.
# Usage:
#   ./scripts/twilio_test.sh --dry-run
#   ./scripts/twilio_test.sh --live "Message text"

set -euo pipefail

MODE="--dry-run"
INCLUDE_ORCID=0
OUT_JSON=0
# allow passing --include-orcid in any position
for a in "$@"; do
  if [ "$a" = "--include-orcid" ]; then INCLUDE_ORCID=1; fi
done
if [ "$#" -gt 0 ]; then MODE="$1"; fi
if [ "$#" -gt 1 ] && [ "$2" = "--json" ]; then OUT_JSON=1; fi

print_payload() {
  ORCID_FIELD=""
  if [ "$INCLUDE_ORCID" -eq 1 ]; then
    if [ -n "${ORCID_URL:-}" ]; then
      ORCID_FIELD=", \"orcid_url\": \"${ORCID_URL}\""
    elif [ -n "${ORCID_ID:-}" ]; then
      ORCID_FIELD=", \"orcid_id\": \"${ORCID_ID}\""
    fi
  fi
  if [ "$OUT_JSON" -eq 1 ]; then
    cat <<JSON
{"twilio_account_sid": "${TWILIO_ACCOUNT_SID:-}", "twilio_from": "${TWILIO_FROM:-}", "twilio_to": "${TWILIO_TO:-}", "body": "$1"${ORCID_FIELD}}
JSON
  else
    cat <<EOF
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID:-}
TWILIO_FROM=${TWILIO_FROM:-}
TWILIO_TO=${TWILIO_TO:-}
$( [ -n "${ORCID_URL:-}" ] && echo "ORCID_URL=${ORCID_URL}" )
$( [ -n "${ORCID_ID:-}" ] && echo "ORCID_ID=${ORCID_ID}" )
Body=$1
EOF
  fi
}

echo "Twilio test helper (mode: $MODE)"

if [ "$MODE" = "--dry-run" ]; then
  echo "Dry run: will print payload but not send. Set --live to actually attempt a send."
  print_payload ""
  exit 0
fi

if [ "$MODE" = "--live" ]; then
  MSG="${2:-Test message from repo}"
  # append ORCID info to the message when requested
  if [ "$INCLUDE_ORCID" -eq 1 ]; then
    if [ -n "${ORCID_URL:-}" ]; then
      MSG="$MSG\nORCID: ${ORCID_URL}"
    elif [ -n "${ORCID_ID:-}" ]; then
      MSG="$MSG\nORCID: https://orcid.org/${ORCID_ID}"
    fi
  fi
  if [ -z "${TWILIO_ACCOUNT_SID:-}" ] || [ -z "${TWILIO_AUTH_TOKEN:-}" ] || [ -z "${TWILIO_FROM:-}" ] || [ -z "${TWILIO_TO:-}" ]; then
    echo "Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM and TWILIO_TO to perform live test." >&2
    exit 2
  fi
  echo "Sending live test message to $TWILIO_TO"
  API_URL="https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json"
  resp=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}" \
    --data-urlencode "From=${TWILIO_FROM}" \
    --data-urlencode "To=${TWILIO_TO}" \
    --data-urlencode "Body=${MSG}")
  http_code=$(echo "$resp" | tail -n1)
  body=$(echo "$resp" | sed '$d')
  if [ "$OUT_JSON" -eq 1 ]; then
    echo "{\"http_code\": $http_code, \"body\": \"$(echo "$body" | sed ':a;N;$!ba;s/\n/\\n/g')\"}"
  else
    echo "HTTP code: $http_code"
    echo "$body"
  fi
  exit 0
fi

echo "Unknown mode: $MODE" >&2
exit 1
