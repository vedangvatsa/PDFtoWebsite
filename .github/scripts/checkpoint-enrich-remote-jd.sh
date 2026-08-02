#!/usr/bin/env bash
# Checkpoint enrich resume state to git so mid-run progress is not lost.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

files=(
  .github/scripts/enrich-remote-job-descriptions.mjs
  .github/scripts/run-enrich-remote-parallel.sh
  .github/scripts/enrich-remote-jd-state.json
  .github/scripts/enrich-remote-jd-state-w0.json
  .github/scripts/enrich-remote-jd-state-w1.json
  .github/scripts/enrich-remote-jd-state-w2.json
  .github/scripts/enrich-remote-jd-state-w3.json
)

# Only stage existing files
existing=()
for f in "${files[@]}"; do
  [[ -f "$f" ]] && existing+=("$f")
done
[[ ${#existing[@]} -eq 0 ]] && exit 0

git add -- "${existing[@]}"
if git diff --cached --quiet; then
  echo "checkpoint: no changes"
  exit 0
fi

curated="?"
if [[ -f .env.local ]]; then
  # shellcheck disable=SC1091
  set -a
  source <(grep -E '^(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_KEY)=' .env.local | sed 's/"//g')
  set +a
  curated="$(node -e "
const U=(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'').replace(/\\/\$/,'');
const K=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_KEY||'';
if(!U||!K){console.log('?');process.exit(0)}
fetch(U+'/rest/v1/jobs?select=id&tags=cs.{curated-jd}',{headers:{apikey:K,Authorization:'Bearer '+K,Prefer:'count=exact'},method:'HEAD'})
  .then(r=>console.log((r.headers.get('content-range')||'').split('/').pop()||'?'))
  .catch(()=>console.log('?'));
" 2>/dev/null || echo '?')"
fi

git commit -m "$(cat <<EOF
chore: checkpoint remote JD enrich state (${curated} curated) [skip ci]

EOF
)"
git push origin HEAD
echo "checkpoint: pushed curated≈${curated}"
