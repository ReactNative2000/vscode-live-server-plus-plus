#!/usr/bin/env bash
# Send an SMS using Twilio's REST API.
# Usage:
#   ./scripts/send_sms_twilio.sh <ACCOUNT_SID> <AUTH_TOKEN> <FROM_NUMBER> <TO_NUMBER> "Message text"
# Or set env vars TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM and pass TO_NUMBER and message.

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 ACCOUNT_SID AUTH_TOKEN FROM_NUMBER TO_NUMBER \"Message text\""
  echo "Or set TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_FROM and pass TO_NUMBER and message"
  exit 1
fi

if [ $# -ge 4 ]; then
  ACCOUNT_SID="$1"
  AUTH_TOKEN="$2"
  FROM_NUMBER="$3"
  TO_NUMBER="$4"
  MESSAGE="$5"
else
  ACCOUNT_SID="${TWILIO_ACCOUNT_SID:-}"
  AUTH_TOKEN="${TWILIO_AUTH_TOKEN:-}"
  FROM_NUMBER="${TWILIO_FROM:-}"
  TO_NUMBER="$1"
  MESSAGE="$2"
fi

if [ -z "$ACCOUNT_SID" ] || [ -z "$AUTH_TOKEN" ] || [ -z "$FROM_NUMBER" ] || [ -z "$TO_NUMBER" ] || [ -z "$MESSAGE" ]; then
  echo "Missing required parameters. See usage." >&2
  exit 2
fi

API_URL="https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json"

response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -u "${ACCOUNT_SID}:${AUTH_TOKEN}" \
  --data-urlencode "From=${FROM_NUMBER}" \
  --data-urlencode "To=${TO_NUMBER}" \
  --data-urlencode "Body=${MESSAGE}")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
  echo "SMS sent successfully (HTTP $http_code)"
  exit 0
else
  echo "Failed to send SMS (HTTP $http_code)" >&2
  echo "Response from Twilio: $body" >&2
  exit 3
fi
