#!/bin/sh
set -e

export ML_SERVICE_URL="${ML_SERVICE_URL:-http://127.0.0.1:8000}"
ML_PORT="${ML_INTERNAL_PORT:-8000}"
WEB_PORT="${PORT:-3000}"

echo "Starting ML service on :${ML_PORT}..."
PORT="$ML_PORT" python3 /app/ml/server.py &
ML_PID=$!

echo "Waiting for ML service..."
TRIES=0
until python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:${ML_PORT}/health')" 2>/dev/null; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 120 ]; then
    echo "ML service failed to start within 120s"
    kill "$ML_PID" 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

echo "ML service ready. Starting Next.js on :${WEB_PORT}..."
exec npm start -- -p "$WEB_PORT" -H 0.0.0.0
