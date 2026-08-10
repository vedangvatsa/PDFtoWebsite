#!/usr/bin/env bash
# DEPRECATED for AI enrich. Default enrich script is MANUAL_ONLY (no LLM).
# This loop only queues scrape packs unless ALLOW_AI_ENRICH=1 is set explicitly.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ "${ALLOW_AI_ENRICH:-}" == "1" || "${ALLOW_AI_ENRICH:-}" == "true" ]]; then
  echo "ERROR: AI enrich loop is disabled by policy. Unset ALLOW_AI_ENRICH; use manual curation (docs/JD_PARAPHRASE_RULES.md)."
  exit 1
fi

export WORKERS="${WORKERS:-2}"
export BATCH_SIZE="${BATCH_SIZE:-50}"
export CONCURRENCY="${CONCURRENCY:-4}"
export RE_ENRICH="${RE_ENRICH:-0}"
export CONTINUOUS="${CONTINUOUS:-0}"
# Never pass TURBO invent paths — manual queue only
unset ALLOW_AI_ENRICH || true

LOG_DIR=".github/scripts"
mkdir -p "$LOG_DIR"

set -a
# shellcheck disable=SC1091
source <(grep -E '^(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_KEY)=' .env.local 2>/dev/null | sed 's/"//g')
set +a

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] MANUAL queue workers=$WORKERS (no LLM keys loaded)"

pids=()
for ((w=0; w<WORKERS; w++)); do
  log="$LOG_DIR/enrich-remote-jd-w${w}.log"
  (
    sleep $((w * 2))
    export WORKER_ID="$w" WORKERS="$WORKERS" BATCH_SIZE="$BATCH_SIZE" \
      CONCURRENCY="$CONCURRENCY" BATCH_NUM=1
    node .github/scripts/enrich-remote-job-descriptions.mjs >>"$log" 2>&1 || true
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] worker $w done" >>"$log"
  ) &
  pids+=($!)
done

for pid in "${pids[@]}"; do
  wait "$pid" || true
done
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] all queue workers finished → .github/scripts/manual-jd-queue/"
