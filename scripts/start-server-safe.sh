#!/usr/bin/env bash
# Start the server on PORT if free, otherwise pick fallback port (3010).
# Writes chosen port to .server-port for other scripts.

set -euo pipefail
PREFERRED=${1:-3000}
FALLBACK=${2:-3010}
ORCID_CLIENT_ID=${ORCID_CLIENT_ID:-}
ORCID_CLIENT_SECRET=${ORCID_CLIENT_SECRET:-}
ORCID_REDIRECT_URI=${ORCID_REDIRECT_URI:-}

is_port_free(){
  local p=$1
  ss -ltn "sport = :$p" >/dev/null 2>&1 || true
  # ss returns 0 even if no match; instead check via grep
  ss -ltnp 2>/dev/null | grep ":$p" >/dev/null 2>&1 && return 1 || return 0
}

choose_port=$PREFERRED
if ! is_port_free $choose_port; then
  echo "Preferred port $choose_port is in use; trying fallback $FALLBACK"
  choose_port=$FALLBACK
  if ! is_port_free $choose_port; then
    echo "Fallback port $choose_port is also in use. Please free a port or specify a different port." >&2
    exit 2
  fi
fi

export PORT=$choose_port
export ORCID_CLIENT_ID
export ORCID_CLIENT_SECRET
export ORCID_REDIRECT_URI

# Start server in background
nohup node server/index.js > /tmp/lspp-server.log 2>&1 &
echo $! > /tmp/lspp-server.pid
sleep 1
# write chosen port for other scripts to read
echo $choose_port > .server-port

# Wait for health
for i in {1..15}; do
  if curl -sSf "http://127.0.0.1:$choose_port/health" >/dev/null 2>&1; then
    echo "Server started on port $choose_port (pid $(cat /tmp/lspp-server.pid))"
    exit 0
  fi
  sleep 1
done

echo "Server failed to start or health check did not pass. See /tmp/lspp-server.log" >&2
exit 1
