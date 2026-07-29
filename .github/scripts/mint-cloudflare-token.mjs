/**
 * Mint a short-lived Cloudflare access token from the Wrangler OAuth
 * offline refresh token. Prints only "key=value" lines for GITHUB_ENV.
 * Never logs token values.
 */
import { appendFileSync } from "node:fs";

const refresh = process.env.CLOUDFLARE_REFRESH_TOKEN || "";
const clientId =
  process.env.CLOUDFLARE_OAUTH_CLIENT_ID ||
  "54d11594-84e4-41aa-b438-e81b8fa78ee7";
const fallback = process.env.CLOUDFLARE_API_TOKEN_FALLBACK || "";
const githubEnv = process.env.GITHUB_ENV;

function writeEnv(token) {
  // Mask in Actions logs
  console.log(`::add-mask::${token}`);
  if (githubEnv) {
    appendFileSync(githubEnv, `CLOUDFLARE_API_TOKEN=${token}\n`);
  }
}

let access = "";

if (refresh) {
  try {
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
    const json = await res.json();
    if (json.access_token) {
      access = json.access_token;
      console.log("Minted Cloudflare OAuth access token via refresh");
    } else {
      console.log("OAuth refresh did not return access_token; will try fallback");
    }
  } catch (e) {
    console.log("OAuth refresh request failed; will try fallback");
  }
}

if (!access && fallback) {
  access = fallback;
  console.log("Using CLOUDFLARE_API_TOKEN fallback secret");
}

if (!access) {
  console.error("Unable to obtain Cloudflare credentials");
  process.exit(1);
}

writeEnv(access);
console.log("Cloudflare credentials ready");
