#!/usr/bin/env bash
# Send an SMS to Brandon Shelton at +1 314-619-7822
# Usage:
#   ./scripts/send_sms_to_brandon.sh [-y|--yes] "Message text"
# The -y/--yes flag skips the interactive confirmation.
# Requires either:
# - Environment variables TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM set, and the main script at scripts/send_sms_twilio.sh is optional, or
# - Make scripts/send_sms_twilio.sh executable and it will be used if available.

set -euo pipefail

TO="${TWILIO_TO:-+13146197822}"
DEFAULT_MSG="Hello from vscode-live-server-plus-plus — this is a test message."

# Support -y/--yes to skip confirmation
AUTO_CONFIRM=0
if [ "${1:-}" = "-y" ] || [ "${1:-}" = "--yes" ]; then
  AUTO_CONFIRM=1
  shift
fi

MSG="${1:-$DEFAULT_MSG}"

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
MAIN_SCRIPT="$ROOT_DIR/scripts/send_sms_twilio.sh"

echo "About to send SMS to ${TO}."
echo "Message: ${MSG}"
if [ "$AUTO_CONFIRM" -eq 0 ]; then
  read -r -p "Proceed and send SMS? [y/N]: " CONFIRM
  case "${CONFIRM:-}" in
    [yY]|[yY][eE][sS]) ;;
    *) echo "Aborted."; exit 0 ;;
  esac
else
  echo "Auto-confirm enabled; sending without prompt."
fi

if [ -x "$MAIN_SCRIPT" ]; then
  echo "Using existing twilio script: $MAIN_SCRIPT"
  # If TWILIO_* env vars are set, they will be used by the main script
  # The main script supports either env vars or explicit params; prefer env vars for safety
  if [ -n "${TWILIO_ACCOUNT_SID:-}" ] && [ -n "${TWILIO_AUTH_TOKEN:-}" ] && [ -n "${TWILIO_FROM:-}" ]; then
    "$MAIN_SCRIPT" "${TWILIO_ACCOUNT_SID}" "${TWILIO_AUTH_TOKEN}" "${TWILIO_FROM}" "$TO" "$MSG"
  else
    # Call main script letting it read env vars or prompt per its behaviour
    "$MAIN_SCRIPT" "$TO" "$MSG"
  fi
  exit $?
fi

# Fallback: use curl directly with TWILIO env vars
if [ -z "${TWILIO_ACCOUNT_SID:-}" ] || [ -z "${TWILIO_AUTH_TOKEN:-}" ] || [ -z "${TWILIO_FROM:-}" ]; then
  echo "Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM, or make $MAIN_SCRIPT executable." >&2
  exit 2
fi

API_URL="https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json"

echo "Sending SMS to ${TO}..."
resp=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}" \
  --data-urlencode "From=${TWILIO_FROM}" \
  --data-urlencode "To=${TO}" \
  --data-urlencode "Body=${MSG}")

http_code=$(echo "$resp" | tail -n1)
body=$(echo "$resp" | sed '$d')

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
  echo "SMS sent successfully (HTTP $http_code)"
  if command -v jq >/dev/null 2>&1; then
    echo "$body" | jq .
  else
    echo "$body"
  fi
  exit 0
else
  echo "Failed to send SMS (HTTP $http_code)" >&2
  echo "Response: $body" >&2
  exit 3
fi
