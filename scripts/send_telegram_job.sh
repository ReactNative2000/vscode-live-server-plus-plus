#!/usr/bin/env bash
# Simple helper to send a job message to a Telegram chat via a bot.
# Usage:
#   ./scripts/send_telegram_job.sh <BOT_TOKEN> <CHAT_ID> path/to/job.txt
# or set env vars TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID and run:
#   TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... ./scripts/send_telegram_job.sh path/to/job.txt

set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 BOT_TOKEN CHAT_ID path/to/job.txt"
  echo "Alternatively set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID and pass path/to/job.txt"
  exit 1
fi

if [ $# -eq 1 ]; then
  JOB_FILE="$1"
  BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
  CHAT_ID="${TELEGRAM_CHAT_ID:-}"
else
  BOT_TOKEN="$1"
  CHAT_ID="$2"
  JOB_FILE="${3:-}" 
fi

if [ -z "$BOT_TOKEN" ] || [ -z "$CHAT_ID" ]; then
  echo "Error: BOT_TOKEN and CHAT_ID are required (or set TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)"
  exit 2
fi

if [ -z "$JOB_FILE" ] || [ ! -f "$JOB_FILE" ]; then
  echo "Error: job file not provided or not found: $JOB_FILE"
  exit 3
fi

API_URL="https://api.telegram.org/bot${BOT_TOKEN}/sendMessage"

# Use --data-urlencode with @file to avoid manual escaping
http_code=$(curl -s -w "%{http_code}" -o /tmp/telegram_send_out.txt -X POST "$API_URL" \
  --data-urlencode "chat_id=${CHAT_ID}" \
  --data-urlencode "text@${JOB_FILE}" )

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
  echo "Message sent (HTTP $http_code)"
  rm -f /tmp/telegram_send_out.txt
  exit 0
else
  echo "Telegram API returned HTTP $http_code"
  echo "Response preview:" >&2
  sed -n '1,200p' /tmp/telegram_send_out.txt >&2
  exit 4
fi
