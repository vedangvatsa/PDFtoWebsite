/**
 * If OAuth mint rotated the refresh token, update the GitHub Actions secret
 * so the next deploy does not get invalid_grant.
 *
 * Requires CLOUDFLARE_SECRETS_PAT (gh auth token or classic PAT with secrets:write).
 * If missing, prints a clear warning but does not fail the deploy.
 */
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";

const rotated = process.env.REFRESH_ROTATED === "true";
const tokenFile = "cf-refresh-rotated.token";
const pat =
  process.env.CLOUDFLARE_SECRETS_PAT ||
  process.env.GH_PAT ||
  process.env.SECRET_UPDATE_PAT ||
  "";
const repo = process.env.GITHUB_REPOSITORY; // owner/repo
// New short-lived access token from mint (optional — keeps next run fast)
const newAccess = (process.env.CLOUDFLARE_API_TOKEN || "").trim();

if (!rotated || !existsSync(tokenFile)) {
  console.log("No refresh token rotation to persist");
  process.exit(0);
}

const newRefresh = readFileSync(tokenFile, "utf8").trim();
try {
  unlinkSync(tokenFile);
} catch {}

if (!newRefresh) {
  console.log("Empty rotated token — skip");
  process.exit(0);
}

if (!pat) {
  console.warn(
    "WARN: OAuth refresh token rotated but CLOUDFLARE_SECRETS_PAT is not set. " +
      "Next deploy may fail with invalid_grant. " +
      "Create a long-lived API token at dash.cloudflare.com/profile/api-tokens " +
      "or set CLOUDFLARE_SECRETS_PAT so rotation can be saved."
  );
  process.exit(0);
}

if (!repo) {
  console.error("Missing GITHUB_REPOSITORY");
  process.exit(1);
}

function setSecret(name, value) {
  const r = spawnSync(
    "gh",
    ["secret", "set", name, "--repo", repo, "--body", value],
    {
      env: { ...process.env, GH_TOKEN: pat, GITHUB_TOKEN: pat },
      encoding: "utf8",
    }
  );
  if (r.status !== 0) {
    console.warn(`WARN: failed to update ${name}:`, r.stderr || r.stdout);
    return false;
  }
  console.log(`Updated ${name} secret`);
  return true;
}

setSecret("CLOUDFLARE_REFRESH_TOKEN", newRefresh);
// Also refresh the access token secret so the next run can skip mint while valid
if (newAccess && newAccess.length > 20) {
  setSecret("CLOUDFLARE_API_TOKEN", newAccess);
}
