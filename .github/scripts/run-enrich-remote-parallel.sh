#!/usr/bin/env bash
# Launch N parallel continuous enrich workers until each shard is done.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# Load env (strip quotes)
set -a
# shellcheck disable=SC1091
source <(grep -E '^(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_KEY|GEMINI_API_KEY|GEMINI_API_KEY_[0-9]|GEMINI_MODEL|GROQ_API_KEY|GROQ_API_KEY_[0-9]|OPENAI_API_KEY|OPENAI_MODEL|COHERE_API_KEY|COHERE_API_KEY_[0-9]|ANTHROPIC_API_KEY)=' .env.local | sed 's/"//g')
set +a

WORKERS="${WORKERS:-4}"
BATCH_SIZE="${BATCH_SIZE:-400}"
CONCURRENCY="${CONCURRENCY:-3}"
# RE_ENRICH=1 rewrites live jobs with description < 600 words (SEO floor)
RE_ENRICH="${RE_ENRICH:-0}"
# TURBO=1: high concurrency, gpt-4o-mini, hash-balanced providers, no sleep
TURBO="${TURBO:-0}"
LOG_DIR=".github/scripts"
mkdir -p "$LOG_DIR"

echo "Starting $WORKERS continuous enrich workers (batch=$BATCH_SIZE concurrency=$CONCURRENCY RE_ENRICH=$RE_ENRICH TURBO=$TURBO)"

pids=()
for ((w=0; w<WORKERS; w++)); do
  log="$LOG_DIR/enrich-remote-jd-w${w}.log"
  echo "  worker $w → $log"
  (
    export WORKER_ID="$w" WORKERS="$WORKERS" BATCH_SIZE="$BATCH_SIZE" CONCURRENCY="$CONCURRENCY" CONTINUOUS=1 BATCH_NUM=2 RE_ENRICH="$RE_ENRICH" TURBO="$TURBO"
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
