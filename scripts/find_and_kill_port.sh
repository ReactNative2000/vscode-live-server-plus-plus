#!/usr/bin/env bash
# Helper: show process using a TCP port and optionally kill it.
# Usage:
#   ./scripts/find_and_kill_port.sh 3000        # prints info
#   ./scripts/find_and_kill_port.sh 3000 --kill # attempts to kill the PID (requires permission)

set -euo pipefail
PORT="$1"
DO_KILL=0
if [ "${2:-}" = "--kill" ]; then DO_KILL=1; fi

echo "Searching for process listening on port ${PORT}..."
# use ss or lsof if available
if command -v ss >/dev/null 2>&1; then
  ss -ltnp | grep ":${PORT}" || true
fi
if command -v lsof >/dev/null 2>&1; then
  lsof -iTCP:${PORT} -sTCP:LISTEN -P -n || true
fi

# Try to extract PID (works for ss output format 'users:("node",pid=1234,fd=...)')
PID=""
PID=$(ss -ltnp 2>/dev/null | grep ":${PORT}" | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -n1 || true)
if [ -z "$PID" ]; then
  # fallback: try lsof
  PID=$(lsof -tiTCP:${PORT} -sTCP:LISTEN || true)
fi

if [ -z "$PID" ]; then
  echo "No PID found for port ${PORT}";
  exit 0;
fi

echo "Found PID: $PID"
ps -fp $PID || true

if [ "$DO_KILL" -eq 1 ]; then
  echo "Attempting to kill $PID (requires permission)..."
  kill $PID && echo "Sent TERM to $PID" || ( echo "Failed to kill $PID — you may need sudo" && exit 2 )
fi

exit 0
