#!/usr/bin/env bash
# Restart thin-curated RE_ENRICH until the priority list is exhausted.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
export ALLOW_AI_ENRICH=1 RE_ENRICH=1 TURBO=1 CONTINUOUS=1
export BATCH_SIZE="${BATCH_SIZE:-500}"
export CONCURRENCY="${CONCURRENCY:-48}"
export PRIORITY_IDS_FILE=.github/scripts/thin-curated-priority.ids
LOG="${LOG:-/tmp/re-enrich-thin.log}"
while true; do
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) thin-enrich start BATCH=$BATCH_SIZE CONC=$CONCURRENCY ===" >>"$LOG"
  npx tsx .github/scripts/enrich-remote-job-descriptions.mjs >>"$LOG" 2>&1 || true
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) thin-enrich exited $? — sleep 15 ===" >>"$LOG"
  sleep 15
done
