#!/usr/bin/env bash
set -euo pipefail
# e2e_stripe_test.sh - simple end-to-end test using ngrok
# Requirements: ngrok in PATH, jq, curl. STRIPE_SECRET and ADMIN_TOKEN in env for test mode.

PORT=${PORT:-3000}
NGROK=$(command -v ngrok || true)
if [[ -z "$NGROK" ]]; then
  echo "ngrok not found in PATH; please install ngrok to run this test." >&2
  exit 2
fi

echo "Starting ngrok on port $PORT..."
${NGROK} http $PORT --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
sleep 2

NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url')
if [[ -z "$NGROK_URL" || "$NGROK_URL" == "null" ]]; then
  echo "Failed to get ngrok URL. Check ngrok dashboard at http://127.0.0.1:4040" >&2
  kill $NGROK_PID || true
  exit 2
fi

echo "ngrok URL: $NGROK_URL"
echo "Register this URL as your Stripe webhook endpoint: ${NGROK_URL}/webhook"

echo "Creating a test Checkout session via /create-checkout..."
RESP=$(curl -s -X POST "$NGROK_URL/create-checkout" -H 'Content-Type: application/json' -d '{"amount":500,"currency":"USD","customer_email":"test@example.com"}')
echo "Response: $RESP"

echo "Waiting 10s for webhook delivery (simulate completing checkout in browser if needed)..."
sleep 10

echo "Checking latest payments in DB via admin endpoint..."
if [[ -z "${ADMIN_TOKEN:-}" ]]; then
  echo "ADMIN_TOKEN not set; cannot query admin endpoint." >&2
else
  curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" "$NGROK_URL/admin/payments" | jq '.'
fi

echo "Stopping ngrok (pid $NGROK_PID)"
kill $NGROK_PID || true

echo "E2E done."
