#!/usr/bin/env bash
# Launch N parallel continuous enrich workers until each shard is done.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# Load env (strip quotes)
set -a
# shellcheck disable=SC1091
source <(grep -E '^(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_KEY|GEMINI_API_KEY)=' .env.local | sed 's/"//g')
set +a

WORKERS="${WORKERS:-4}"
BATCH_SIZE="${BATCH_SIZE:-400}"
CONCURRENCY="${CONCURRENCY:-3}"
LOG_DIR=".github/scripts"
mkdir -p "$LOG_DIR"

echo "Starting $WORKERS continuous enrich workers (batch=$BATCH_SIZE concurrency=$CONCURRENCY)"

pids=()
for ((w=0; w<WORKERS; w++)); do
  log="$LOG_DIR/enrich-remote-jd-w${w}.log"
  echo "  worker $w → $log"
  (
    export WORKER_ID="$w" WORKERS="$WORKERS" BATCH_SIZE="$BATCH_SIZE" CONCURRENCY="$CONCURRENCY" CONTINUOUS=1 BATCH_NUM=2
    node .github/scripts/enrich-remote-job-descriptions.mjs
    echo "ENRICH_WORKER_DONE w=$w exit=$?"
  ) >"$log" 2>&1 &
  pids+=($!)
done

echo "PIDs: ${pids[*]}"
echo "${pids[*]}" > "$LOG_DIR/enrich-remote-jd-worker-pids.txt"

# Wait for all workers
fail=0
for pid in "${pids[@]}"; do
  if ! wait "$pid"; then
    fail=1
  fi
done

echo "ENRICH_ALL_WORKERS_DONE fail=$fail"
exit "$fail"
