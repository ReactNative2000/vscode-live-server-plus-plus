#!/usr/bin/env bash
# create_render_service.sh
# Creates a branch-deploy Web Service on Render using the Render REST API.
# Usage: bash create_render_service.sh
set -euo pipefail

# Check required tools
command -v curl >/dev/null 2>&1 || { echo "curl is required. Install it and retry."; exit 1; }
command -v jq >/dev/null 2>&1 || echo "Note: jq not found. Output will be raw JSON. (jq makes output nicer.)"

read -r -p "Render API key (paste now; will not be stored): " RENDER_API_KEY
if [ -z "$RENDER_API_KEY" ]; then
  echo "No API key provided, aborting."
  exit 1
fi

# Defaults - change if you want
DEFAULT_REPO="ReactNative2000/vscode-live-server-plus-plus"
DEFAULT_BRANCH="feature/payments-admin"
DEFAULT_NAME="vscode-live-server-plus-admin-feature-payments-admin"
DEFAULT_REGION="oregon"   # change if you prefer
DEFAULT_ADMIN_TOKEN="devtoken"

read -r -p "Repository (owner/repo) [${DEFAULT_REPO}]: " INPUT_REPO
REPO="${INPUT_REPO:-$DEFAULT_REPO}"

read -r -p "Branch to deploy [${DEFAULT_BRANCH}]: " INPUT_BRANCH
BRANCH="${INPUT_BRANCH:-$DEFAULT_BRANCH}"

read -r -p "Service name on Render [${DEFAULT_NAME}]: " INPUT_NAME
SERVICE_NAME="${INPUT_NAME:-$DEFAULT_NAME}"

read -r -p "Region [${DEFAULT_REGION}]: " INPUT_REGION
REGION="${INPUT_REGION:-$DEFAULT_REGION}"

read -r -p "ADMIN_TOKEN to set in service env (dev/test) [${DEFAULT_ADMIN_TOKEN}]: " INPUT_ADMIN_TOKEN
ADMIN_TOKEN="${INPUT_ADMIN_TOKEN:-$DEFAULT_ADMIN_TOKEN}"

# Build and start commands - adapt if your repo needs different steps
BUILD_CMD="npm install && npm run build || true"
START_CMD="env ADMIN_TOKEN=${ADMIN_TOKEN} node server/index.js"

echo
echo "Creating Render service:"
echo "  repo: ${REPO}"
echo "  branch: ${BRANCH}"
echo "  name: ${SERVICE_NAME}"
echo "  region: ${REGION}"
echo

PAYLOAD=$(cat <<EOF
{
  "service": {
    "name": "${SERVICE_NAME}",
    "repo": "https://github.com/${REPO}.git",
    "branch": "${BRANCH}",
    "type": "web_service",
    "buildCommand": "${BUILD_CMD}",
    "startCommand": "${START_CMD}",
    "envVars": [
      {"key":"ADMIN_TOKEN","value":"${ADMIN_TOKEN}","secure":true}
    ],
    "region": "${REGION}"
  }
}
EOF
)

# Create service
echo "Requesting Render to create service..."
RESP=$(curl -sS -X POST \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}" \
  "https://api.render.com/v1/services" || true)

if [ -z "$RESP" ]; then
  echo "No response from Render API. Check network or API key."
  exit 1
fi

echo
if command -v jq >/dev/null 2>&1; then
  echo "$RESP" | jq .
else
  echo "$RESP"
fi

SERVICE_ID=$(echo "$RESP" | jq -r '.id // .service.id // empty' 2>/dev/null || true)
if [ -z "$SERVICE_ID" ]; then
  echo
  echo "Could not determine created service ID from response. Inspect above JSON for errors."
  exit 1
fi

echo
echo "Service created with id: ${SERVICE_ID}"
echo "Polling service deploys (will wait up to ~10 minutes)..."
echo

# Poll for last deploy status until success/failure or timeout
MAX_ITER=120   # check up to ~10 minutes (120 * 5s)
ITER=0
SLEEP=5

while [ $ITER -lt $MAX_ITER ]; do
  sleep $SLEEP
  ((ITER++))
  # Fetch service details
  DETAILS=$(curl -sS -H "Authorization: Bearer ${RENDER_API_KEY}" "https://api.render.com/v1/services/${SERVICE_ID}" || true)
  if [ -z "$DETAILS" ]; then
    echo "Empty response getting service details; trying again..."
    continue
  fi

  # Try to extract live URL and last deploy status
  LIVE_URL=$(echo "$DETAILS" | jq -r '.liveUrl // .service.liveUrl // empty' 2>/dev/null || true)
  LATEST_DEPLOY_ID=$(echo "$DETAILS" | jq -r '.latestDeploy.id // .service.latestDeploy.id // empty' 2>/dev/null || true)

  if [ -n "$LATEST_DEPLOY_ID" ]; then
    DEPLOY=$(curl -sS -H "Authorization: Bearer ${RENDER_API_KEY}" "https://api.render.com/v1/services/${SERVICE_ID}/deploys/${LATEST_DEPLOY_ID}" || true)
    if [ -n "$DEPLOY" ]; then
      STATUS=$(echo "$DEPLOY" | jq -r '.status // empty' 2>/dev/null || true)
      echo "Deploy ${LATEST_DEPLOY_ID} status: ${STATUS}"
      if [ "$STATUS" = "successful" ]; then
        echo
        echo "Deploy succeeded."
        if [ -n "$LIVE_URL" ] && [ "$LIVE_URL" != "null" ]; then
          echo "Service URL: ${LIVE_URL}"
        fi
        exit 0
      elif [ "$STATUS" = "failed" ]; then
        echo
        echo "Deploy failed. Inspect deploy object above for logs."
        if command -v jq >/dev/null 2>&1; then
          echo "$DEPLOY" | jq .
        else
          echo "$DEPLOY"
        fi
        exit 1
      fi
    fi
  else
    echo "Waiting for initial deploy to be created..."
  fi

  # print live URL if available
  if [ -n "$LIVE_URL" ] && [ "$LIVE_URL" != "null" ]; then
    echo "Live URL (may not be ready): ${LIVE_URL}"
  fi
done

echo "Timed out waiting for deploy to finish (~10 minutes). Check the Render dashboard for service ${SERVICE_ID}."
exit 1
