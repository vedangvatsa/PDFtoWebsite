#!/usr/bin/env bash
# Queue scrape packs for manual JD enrichment (no LLM). See docs/JD_PARAPHRASE_RULES.md
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ "${ALLOW_AI_ENRICH:-}" == "1" || "${ALLOW_AI_ENRICH:-}" == "true" ]]; then
  echo "ERROR: AI enrich disabled by policy. Unset ALLOW_AI_ENRICH."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source <(grep -E '^(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_KEY)=' .env.local 2>/dev/null | sed 's/"//g')
set +a

WORKERS="${WORKERS:-4}"
BATCH_SIZE="${BATCH_SIZE:-50}"
CONCURRENCY="${CONCURRENCY:-4}"
LOG_DIR=".github/scripts"
mkdir -p "$LOG_DIR"

echo "Starting $WORKERS MANUAL queue workers (batch=$BATCH_SIZE) → .github/scripts/manual-jd-queue/"

pids=()
for ((w=0; w<WORKERS; w++)); do
  log="$LOG_DIR/enrich-remote-jd-w${w}.log"
  echo "  worker $w → $log"
  (
    export WORKER_ID="$w" WORKERS="$WORKERS" BATCH_SIZE="$BATCH_SIZE" CONCURRENCY="$CONCURRENCY" BATCH_NUM=1
    unset ALLOW_AI_ENRICH || true
    node .github/scripts/enrich-remote-job-descriptions.mjs
    echo "QUEUE_WORKER_DONE w=$w exit=$?"
  ) >"$log" 2>&1 &
  pids+=($!)
done

echo "PIDs: ${pids[*]}"
wait
echo "Done. Packs in .github/scripts/manual-jd-queue/"
