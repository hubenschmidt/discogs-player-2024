#!/bin/sh
set -e

# --- config ---
APP_CMD="node dist/index.js"          # prod start command
MIGRATE_CMD_PROD="npx sequelize-cli db:migrate --config dist/conf/db.js --migrations-path dist/migrations"
MIGRATE_CMD_DEV="npx sequelize-cli db:migrate --config src/conf/db.js --migrations-path src/migrations"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_WAIT_RETRIES="${DB_WAIT_RETRIES:-30}"   # ~30s default
MIGRATE_RETRIES="${MIGRATE_RETRIES:-3}"
SLEEP_BETWEEN="${SLEEP_BETWEEN:-1}"

echo "Starting web immediately so health checks pass..."
# Start web in background (must listen on 0.0.0.0:$PORT inside your app code)
$APP_CMD &
WEB_PID=$!

# Ensure we clean up the web process on exit/signals
term_handler() {
  echo "Received signal, stopping web (pid $WEB_PID)..."
  kill "$WEB_PID" 2>/dev/null || true
  wait "$WEB_PID" 2>/dev/null || true
  exit 143
}
trap term_handler TERM INT

# --- wait for DB ---
echo "Waiting for DB ${DB_HOST}:${DB_PORT} ..."
i=0
while ! (echo > /dev/tcp/$DB_HOST/$DB_PORT) 2>/dev/null; do
  i=$((i+1))
  if [ "$i" -ge "$DB_WAIT_RETRIES" ]; then
    echo "ERROR: DB not reachable after $DB_WAIT_RETRIES seconds"
    kill "$WEB_PID" 2>/dev/null || true
    wait "$WEB_PID" 2>/dev/null || true
    exit 1
  fi
  sleep "$SLEEP_BETWEEN"
done
echo "DB is reachable."

# --- run migrations (with retries) ---
echo "Running migrations..."
if [ "${NODE_ENV}" = "production" ]; then
  CMD="$MIGRATE_CMD_PROD"
else
  CMD="$MIGRATE_CMD_DEV"
fi

attempt=1
until $CMD; do
  if [ "$attempt" -ge "$MIGRATE_RETRIES" ]; then
    echo "ERROR: migrations failed after $MIGRATE_RETRIES attempts."
    kill "$WEB_PID" 2>/dev/null || true
    wait "$WEB_PID" 2>/dev/null || true
    exit 1
  fi
  attempt=$((attempt+1))
  echo "Migration attempt $((attempt-1)) failed; retrying in 3s..."
  sleep 3
done
echo "Migrations complete."

# --- foreground the web process ---
wait "$WEB_PID"
