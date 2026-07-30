/**
 * Resolve Cloudflare credentials for deploy.
 *
 * Prefer a long-lived API token (CLOUDFLARE_API_TOKEN) — it does NOT rotate.
 *
 * OAuth refresh tokens DO rotate on every use. The old mint flow discarded the
 * new refresh token, so the secret was dead after one successful deploy.
 * If we mint via OAuth we always persist the rotated refresh token to
 * GITHUB_ENV / GITHUB_OUTPUT so a follow-up step can update the secret.
 *
 * Never logs token values.
 */
import { appendFileSync, writeFileSync } from "node:fs";

const githubEnv = process.env.GITHUB_ENV;
const githubOutput = process.env.GITHUB_OUTPUT;
const clientId =
  process.env.CLOUDFLARE_OAUTH_CLIENT_ID ||
  "54d11594-84e4-41aa-b438-e81b8fa78ee7";

function mask(value) {
  if (!value) return;
  console.log("::add-mask::" + value);
}

function writeEnv(key, value) {
  if (!githubEnv || !value) return;
  appendFileSync(githubEnv, `${key}=${value}\n`);
}

function writeOutput(key, value) {
  if (!githubOutput || !value) return;
  // multiline-safe
  appendFileSync(githubOutput, `${key}=${value}\n`);
}

async function verifyToken(token) {
  const account = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  if (!token || !account) return false;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const json = await res.json().catch(() => ({}));
    return res.ok && json.success === true;
  } catch {
    return false;
  }
}

// ── 1) Prefer static API token (does not expire on use) ──────────────────────
const staticToken = (process.env.CLOUDFLARE_API_TOKEN || "").trim();
if (staticToken) {
  const ok = await verifyToken(staticToken);
  if (ok) {
    mask(staticToken);
    writeEnv("CLOUDFLARE_API_TOKEN", staticToken);
    writeOutput("auth_mode", "api_token");
    console.log("Using long-lived CLOUDFLARE_API_TOKEN (verified)");
    process.exit(0);
  }
  console.log(
    "CLOUDFLARE_API_TOKEN present but invalid/expired — trying OAuth refresh"
  );
}

// ── 2) OAuth refresh (rotating) ──────────────────────────────────────────────
const refresh = (process.env.CLOUDFLARE_REFRESH_TOKEN || "").trim();
if (!refresh) {
  console.error(
    "No valid CLOUDFLARE_API_TOKEN and missing CLOUDFLARE_REFRESH_TOKEN. " +
      "Create a Workers API token at https://dash.cloudflare.com/profile/api-tokens " +
      "and set it as the CLOUDFLARE_API_TOKEN GitHub secret."
  );
  process.exit(1);
}

const res = await fetch("https://dash.cloudflare.com/oauth2/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "wrangler/4.115.0",
    Accept: "application/json",
  },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refresh,
    client_id: clientId,
  }),
});

const json = await res.json().catch(() => ({}));
const access = json.access_token || "";
const newRefresh = json.refresh_token || "";

if (!access) {
  console.error(
    "OAuth refresh failed:",
    json.error || res.status,
    json.error_description || "(no description)",
    "\nFix: set a long-lived CLOUDFLARE_API_TOKEN secret (recommended), or re-run `npx wrangler login` and update CLOUDFLARE_REFRESH_TOKEN."
  );
  process.exit(1);
}

mask(access);
if (newRefresh) mask(newRefresh);

writeEnv("CLOUDFLARE_API_TOKEN", access);
writeOutput("auth_mode", "oauth_refresh");

// CRITICAL: Cloudflare often rotates the refresh token. The previous secret is
// immediately invalid. Expose the new one so the workflow can re-save it.
if (newRefresh && newRefresh !== refresh) {
  // Never put refresh tokens in GITHUB_OUTPUT (can leak in logs).
  // File + optional secret-update step only.
  writeFileSync("cf-refresh-rotated.token", newRefresh, { mode: 0o600 });
  writeOutput("refresh_rotated", "true");
  console.log(
    "OAuth refresh token was rotated — workflow must update CLOUDFLARE_REFRESH_TOKEN secret"
  );
} else {
  writeOutput("refresh_rotated", "false");
  console.log("Minted Cloudflare OAuth access token via refresh (no rotation)");
}
