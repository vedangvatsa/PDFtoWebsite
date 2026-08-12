#!/bin/bash
# Nightly guarded cleanup: delete unenriched jobs (no description) older than 30 days.
cd /Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
set -a
source <(grep -E '^(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_KEY)=' .env.local | sed 's/"//g')
set +a
exec node .github/scripts/cleanup-old-jobs.mjs >> /var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/cleanup-nightly.log 2>&1
