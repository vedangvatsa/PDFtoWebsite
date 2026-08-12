#!/bin/bash
# Fresh-ingest enrichment daemon: continuously sweeps jobs ingested since the
# last sweep (checkpoint-based, so no gap even after downtime), enriches and
# publishes them (indexable page or honest stub).
# AI: OpenRouter inclusionai/ling-2.6-flash ONLY. Other LLM keys are blanked.
# launchd runs with a minimal PATH — node/npx must be resolved explicitly.
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
command -v npx >/dev/null || export PATH="/Users/vedang/.nvm/versions/node/$(ls /Users/vedang/.nvm/versions/node 2>/dev/null | tail -1)/bin:$PATH"

cd /Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite
LOG=/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/daemon.log
CHECKPOINT=/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/daemon-checkpoint
MAX_HOURS="${ENRICH_MAX_WINDOW_HOURS:-900}"

while true; do
  if [ -f "$CHECKPOINT" ]; then
    last=$(cat "$CHECKPOINT")
    now=$(date +%s)
    hours=$(( (now - last) / 3600 + 2 ))
    [ $hours -lt 2 ] && hours=2
    [ $hours -gt $MAX_HOURS ] && hours=$MAX_HOURS
  else
    hours=12
  fi
  echo "$(date +%H:%M:%S) sweep window=${hours}h openrouter=inclusionai/ling-2.6-flash" >> "$LOG"
  pids=()
  for w in 0 1 2 3; do
    nohup env ALLOW_AI_ENRICH=1 RE_ENRICH=1 ENRICH_SINCE_HOURS="$hours" \
      JOB_MAX_AGE_DAYS=9999 TURBO=1 WORKERS=4 WORKER_ID=$w CONCURRENCY=40 BATCH_SIZE=2000 \
      GEMINI_API_KEY= GEMINI_API_KEY_2= GEMINI_API_KEY_3= GEMINI_API_KEY_4= \
      OPENAI_API_KEY= OPENAI_API_KEY_2= OPENAI_API_KEY_3= OPENAI_API_KEY_4= \
      NVIDIA_API_KEY= NVIDIA_API_KEY_2= NVIDIA_API_KEY_3= \
      GROQ_API_KEY= GROQ_API_KEY_2= ANTHROPIC_API_KEY= \
      npx tsx .github/scripts/enrich-remote-job-descriptions.mjs > /var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/daemon-w$w.log 2>&1 &
    pids+=($!)
  done
  deadline=$(( $(date +%s) + 2400 ))
  while (( $(date +%s) < deadline )); do
    alive=0
    for pid in "${pids[@]}"; do kill -0 $pid 2>/dev/null && alive=$((alive+1)); done
    [ $alive -eq 0 ] && break
    for w in 0 1 2 3; do
      f=/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/daemon-w$w.log
      if [ -f "$f" ]; then
        age=$(( $(date +%s) - $(stat -f %m "$f") ))
        if [ $age -gt 900 ]; then
          echo "$(date +%H:%M:%S) hung worker $w killing" >> "$LOG"
          pkill -f "WORKER_ID=$w" 2>/dev/null
        fi
      fi
    done
    sleep 20
  done
  pkill -f "enrich-remote-job-descriptions" 2>/dev/null
  date +%s > "$CHECKPOINT"
  sleep 120
done
