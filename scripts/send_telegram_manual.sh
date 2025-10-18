#!/usr/bin/env bash
# Manual Telegram send helper with BotFather safety checks
# Usage:
#   ./scripts/send_telegram_manual.sh <BOT_TOKEN> <CHAT_ID> "Message text"
# or with env vars:
#   TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... ./scripts/send_telegram_manual.sh "Message text"

set -euo pipefail

USAGE="Usage: $0 BOT_TOKEN CHAT_ID \"Message text\"\nAlternatively set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID and pass the message as the only arg.\n"

if [ "$#" -eq 0 ]; then
  echo -e "$USAGE"
  exit 1
fi

if [ $# -eq 1 ]; then
  MESSAGE="$1"
  BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
  CHAT_ID="${TELEGRAM_CHAT_ID:-}"
else
  BOT_TOKEN="$1"
  CHAT_ID="$2"
  MESSAGE="${3:-}" 
fi

if [ -z "$BOT_TOKEN" ] || [ -z "$CHAT_ID" ] || [ -z "$MESSAGE" ]; then
  echo -e "$USAGE"
  echo "Error: BOT_TOKEN, CHAT_ID and message are required."
  exit 2
fi

# Safety: don't allow sending a bot token or the token string itself in the message
if echo "$MESSAGE" | grep -qE "[0-9]{6,}:[A-Za-z0-9_-]{20,}"; then
  echo "Error: message appears to contain a bot-like token. Remove any tokens from the message and try again."
  exit 3
fi

# Safety: prevent sending to the official BotFather user/chat
BOTFATHER_USERNAMES=("@BotFather" "BotFather")
for name in "${BOTFATHER_USERNAMES[@]}"; do
  if [ "$CHAT_ID" = "$name" ] || [ "$CHAT_ID" = "${name#@}" ]; then
    echo "Error: this script will not send messages to BotFather. Do not send tokens to BotFather."
    exit 4
  fi
done

API_URL="https://api.telegram.org/bot${BOT_TOKEN}/sendMessage"

http_code=$(curl -s -w "%{http_code}" -o /tmp/telegram_send_out.txt -X POST "$API_URL" \
  --data-urlencode "chat_id=${CHAT_ID}" \
  --data-urlencode "text=${MESSAGE}" )

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
  echo "Message sent (HTTP $http_code)"
  rm -f /tmp/telegram_send_out.txt
  exit 0
else
  echo "Telegram API returned HTTP $http_code"
  echo "Response preview:" >&2
  sed -n '1,200p' /tmp/telegram_send_out.txt >&2
  exit 5
fi
