/**
 * Create a long-lived Cloudflare API token for GitHub deploys.
 * Run after `npx wrangler login` (uses oauth_token from ~/.wrangler/config).
 *
 * Usage:
 *   node .github/scripts/create-cf-deploy-token.mjs
 *
 * Prints nothing secret to stdout except success metadata.
 * Writes token once to ./cf-deploy-api.token (gitignored) and can set GH secret.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

const accountId =
  process.env.CLOUDFLARE_ACCOUNT_ID ||
  "90e3caa7ef0a0ac0c1fd38c05b458183";

function loadOauth() {
  const confPath = join(homedir(), ".wrangler/config/default.toml");
  if (!existsSync(confPath)) {
    throw new Error("Missing ~/.wrangler/config/default.toml — run: npx wrangler login");
  }
  const conf = readFileSync(confPath, "utf8");
  const oauth = (conf.match(/oauth_token\s*=\s*"([^"]+)"/) || [])[1];
  if (!oauth) throw new Error("No oauth_token in wrangler config — run: npx wrangler login");
  return oauth;
}

async function main() {
  const oauth = loadOauth();

  // Verify oauth first
  const probe = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts`,
    { headers: { Authorization: `Bearer ${oauth}` } }
  );
  const probeJ = await probe.json().catch(() => ({}));
  if (!probe.ok || !probeJ.success) {
    throw new Error(
      `OAuth token invalid (${probe.status}). Run: npx wrangler login`
    );
  }

  // Permission group catalog
  const pgRes = await fetch(
    "https://api.cloudflare.com/client/v4/user/tokens/permission_groups",
    { headers: { Authorization: `Bearer ${oauth}` } }
  );
  const pgJ = await pgRes.json();
  if (!pgJ.success) {
    throw new Error("Failed to list permission groups: " + JSON.stringify(pgJ.errors));
  }

  const byName = Object.fromEntries((pgJ.result || []).map((g) => [g.name, g.id]));
  const neededNames = [
    "Workers Scripts Write",
    "Workers Routes Write",
    "Workers Tail Read",
    "Account Settings Read",
    "Workers KV Storage Write",
    "Workers Observability Write",
  ];
  const permission_groups = neededNames
    .map((name) => {
      const id = byName[name];
      if (!id) console.warn("Missing permission group:", name);
      return id ? { id } : null;
    })
    .filter(Boolean);

  if (permission_groups.length < 2) {
    throw new Error("Could not resolve required Workers permission groups");
  }

  const body = {
    name: `cvinbio-github-deploy-${new Date().toISOString().slice(0, 10)}`,
    policies: [
      {
        effect: "allow",
        resources: {
          [`com.cloudflare.api.account.${accountId}`]: "*",
        },
        permission_groups,
      },
    ],
  };

  const createRes = await fetch("https://api.cloudflare.com/client/v4/user/tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${oauth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const createJ = await createRes.json();
  if (!createJ.success || !createJ.result?.value) {
    throw new Error(
      "Failed to create API token: " + JSON.stringify(createJ.errors || createJ)
    );
  }

  const apiToken = createJ.result.value;
  writeFileSync("cf-deploy-api.token", apiToken + "\n", { mode: 0o600 });
  console.log("Created long-lived API token:", createJ.result.name, createJ.result.id);
  console.log("Wrote cf-deploy-api.token (do not commit)");

  // Verify
  const v = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts`,
    { headers: { Authorization: `Bearer ${apiToken}` } }
  );
  const vj = await v.json();
  console.log("Verify new API token:", v.status, vj.success ? "ok" : vj.errors);

  // Set GH secret if gh is available
  const set = spawnSync(
    "gh",
    ["secret", "set", "CLOUDFLARE_API_TOKEN", "--body", apiToken],
    { encoding: "utf8" }
  );
  if (set.status === 0) {
    console.log("Updated GitHub secret CLOUDFLARE_API_TOKEN");
  } else {
    console.warn("Could not set GH secret automatically:", set.stderr || set.stdout);
    console.warn("Run: gh secret set CLOUDFLARE_API_TOKEN < cf-deploy-api.token");
  }

  // Update local .env.local
  if (existsSync(".env.local")) {
    let env = readFileSync(".env.local", "utf8");
    if (/^CLOUDFLARE_API_TOKEN=/m.test(env)) {
      env = env.replace(/^CLOUDFLARE_API_TOKEN=.*$/m, `CLOUDFLARE_API_TOKEN=${apiToken}`);
    } else {
      env += `\nCLOUDFLARE_API_TOKEN=${apiToken}\n`;
    }
    writeFileSync(".env.local", env);
    console.log("Updated .env.local CLOUDFLARE_API_TOKEN");
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
