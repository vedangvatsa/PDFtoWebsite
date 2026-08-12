#!/usr/bin/env bash
# Deprecated. Single enrich entry: enrich-remote-job-descriptions.mjs
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
export ALLOW_AI_ENRICH=1
exec node .github/scripts/enrich-remote-job-descriptions.mjs
