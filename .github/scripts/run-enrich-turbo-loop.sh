#!/usr/bin/env bash
# Keep MAX workers alive forever — each worker restarts independently.
# (Old design waited for all 32 to finish → fleet shrank to 1–2 workers mid-wave.)
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# 16 shards keeps every worker busy (32 left many empty/timeout shards)
# OpenAI + Gemini currently out of quota; lean fleet for NVIDIA Nemotron (strict 429s).
export WORKERS="${WORKERS:-2}"
export BATCH_SIZE="${BATCH_SIZE:-400}"
export CONCURRENCY="${CONCURRENCY:-1}"
export RE_ENRICH=1
export TURBO=1
export CONTINUOUS=1
export NVIDIA_ONLY="${NVIDIA_ONLY:-1}"
export OPENAI_FAST_MODEL="${OPENAI_FAST_MODEL:-gpt-4o-mini}"
LOG_DIR=".github/scripts"
mkdir -p "$LOG_DIR"

# Load env
set -a
# shellcheck disable=SC1091
source <(grep -E '^(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_KEY|GEMINI_API_KEY|GEMINI_API_KEY_[0-9]|GEMINI_MODEL|GROQ_API_KEY|GROQ_API_KEY_[0-9]|OPENAI_API_KEY|OPENAI_API_KEY_[0-9]|OPENAI_MODEL|COHERE_API_KEY|COHERE_API_KEY_[0-9]|ANTHROPIC_API_KEY|NVIDIA_API_KEY|NVIDIA_API_KEY_[0-9]|NVIDIA_MODEL|NVIDIA_BASE_URL)=' .env.local 2>/dev/null | sed 's/"//g')
set +a

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] INDEPENDENT turbo supervisors workers=$WORKERS concurrency=$CONCURRENCY"

pids=()
for ((w=0; w<WORKERS; w++)); do
  log="$LOG_DIR/enrich-remote-jd-w${w}.log"
  (
    # Stagger so 16 workers don't all stampede Supabase at t=0
    sleep $((w * 2))
    while true; do
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] worker $w start" >>"$log"
      export WORKER_ID="$w" WORKERS="$WORKERS" BATCH_SIZE="$BATCH_SIZE" \
        CONCURRENCY="$CONCURRENCY" CONTINUOUS=1 BATCH_NUM=1 \
        RE_ENRICH=1 TURBO=1 NVIDIA_ONLY="$NVIDIA_ONLY" OPENAI_FAST_MODEL="$OPENAI_FAST_MODEL"
      node .github/scripts/enrich-remote-job-descriptions.mjs >>"$log" 2>&1 || true
      code=$?
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] worker $w exited code=$code — restart in 2s" >>"$log"
      sleep 2
    done
  ) &
  spid=$!
  pids+=("$spid")
  echo "  supervisor $w pid=$spid → $log"
done

echo "${pids[*]}" > "$LOG_DIR/enrich-turbo-supervisor-pids.txt"
echo "Supervisors: ${pids[*]}"

# Keep parent alive
wait
