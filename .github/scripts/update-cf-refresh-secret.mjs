/**
 * If OAuth mint rotated the refresh token, update the GitHub Actions secret
 * so the next deploy does not get invalid_grant.
 *
 * Requires GH_PAT (or GH_TOKEN with secrets:write) as CLOUDFLARE_SECRETS_PAT.
 * If missing, prints a clear warning but does not fail the deploy.
 */
import { readFileSync, existsSync, unlinkSync } from "node:fs";

const rotated = process.env.REFRESH_ROTATED === "true";
const tokenFile = "cf-refresh-rotated.token";
const pat =
  process.env.CLOUDFLARE_SECRETS_PAT ||
  process.env.GH_PAT ||
  process.env.SECRET_UPDATE_PAT ||
  "";
const repo = process.env.GITHUB_REPOSITORY; // owner/repo

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
      "Prefer a long-lived CLOUDFLARE_API_TOKEN secret instead of OAuth."
  );
  process.exit(0);
}

if (!repo) {
  console.error("Missing GITHUB_REPOSITORY");
  process.exit(1);
}

// Use gh CLI if available
import { spawnSync } from "node:child_process";
const r = spawnSync(
  "gh",
  ["secret", "set", "CLOUDFLARE_REFRESH_TOKEN", "--repo", repo, "--body", newRefresh],
  {
    env: { ...process.env, GH_TOKEN: pat, GITHUB_TOKEN: pat },
    encoding: "utf8",
  }
);

if (r.status !== 0) {
  console.warn("WARN: failed to update CLOUDFLARE_REFRESH_TOKEN secret:", r.stderr || r.stdout);
  process.exit(0);
}

console.log("Updated CLOUDFLARE_REFRESH_TOKEN secret with rotated value");
