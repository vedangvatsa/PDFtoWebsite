/**
 * Mint a short-lived Cloudflare access token from the Wrangler OAuth
 * offline refresh token. Writes CLOUDFLARE_API_TOKEN into GITHUB_ENV.
 * Never logs token values.
 */
import { appendFileSync } from "node:fs";

const refresh = process.env.CLOUDFLARE_REFRESH_TOKEN || "";
const clientId =
  process.env.CLOUDFLARE_OAUTH_CLIENT_ID ||
  "54d11594-84e4-41aa-b438-e81b8fa78ee7";
const githubEnv = process.env.GITHUB_ENV;

if (!refresh) {
  console.error("Missing CLOUDFLARE_REFRESH_TOKEN secret");
  process.exit(1);
}

const body = new URLSearchParams({
  grant_type: "refresh_token",
  refresh_token: refresh,
  client_id: clientId,
});

const res = await fetch("https://dash.cloudflare.com/oauth2/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "wrangler/4.115.0",
    Accept: "application/json",
  },
  body,
});

const json = await res.json().catch(() => ({}));
const access = json.access_token || "";

if (!access) {
  console.error(
    "OAuth refresh failed:",
    json.error || res.status,
    json.error_description || "(no description)"
  );
  process.exit(1);
}

console.log("::add-mask::" + access);
if (githubEnv) {
  appendFileSync(githubEnv, `CLOUDFLARE_API_TOKEN=${access}\n`);
}
console.log("Minted Cloudflare OAuth access token via refresh");
