#!/usr/bin/env bash
set -euo pipefail

echo "Running quick Twilio dry-run test"
OUT=$(/workspaces/vscode-live-server-plus-plus/scripts/twilio_test.sh --dry-run)
if echo "$OUT" | grep -q "TWILIO_TO"; then
  echo "Found TWILIO_TO in output"
else
  echo "TWILIO_TO missing from output" >&2
  exit 2
fi
echo "Dry-run smoke test passed"
