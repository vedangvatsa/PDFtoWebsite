#!/usr/bin/env node
/**
 * Deprecated wrapper. Company-about + JD enrich live in one script:
 *   ALLOW_AI_ENRICH=1 ABOUT_ONLY=1 node .github/scripts/enrich-remote-job-descriptions.mjs
 */
process.env.ALLOW_AI_ENRICH = process.env.ALLOW_AI_ENRICH || '1';
process.env.ABOUT_ONLY = '1';
await import('./enrich-remote-job-descriptions.mjs');
