/**
 * Temp inventory script — lists Vercel projects/domains using GH secrets.
 * Does not print the token.
 */
import { appendFileSync } from "node:fs";

const token = process.env.VERCEL_TOKEN || "";
const team = process.env.VERCEL_ORG_ID || "";
const knownProject = process.env.VERCEL_PROJECT_ID || "";
const summary = process.env.GITHUB_STEP_SUMMARY;

function log(line = "") {
  console.log(line);
  if (summary) appendFileSync(summary, line + "\n");
}

async function api(path) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 300) };
  }
  return { status: res.status, body };
}

if (!token) {
  log("### Vercel inventory");
  log("NO_VERCEL_TOKEN");
  process.exit(0);
}

log("### Vercel inventory");
log("");
log("#### Secrets context");
log(`- VERCEL_ORG_ID set: ${team ? "yes" : "no"}`);
log(`- VERCEL_PROJECT_ID: ${knownProject || "(none)"}`);

const user = await api("/v2/user");
log("");
log("#### User");
if (user.status !== 200) {
  log(`- lookup failed status=${user.status} body=${JSON.stringify(user.body).slice(0, 300)}`);
} else {
  const u = user.body.user || user.body;
  log(`- username: ${u.username}`);
  log(`- email: ${u.email}`);
  log(`- id: ${u.uid || u.id}`);
}

const teams = await api("/v2/teams");
log("");
log("#### Teams");
if (teams.status !== 200) {
  log(`- lookup failed status=${teams.status}`);
} else {
  const list = teams.body.teams || [];
  if (!list.length) log("(none)");
  for (const t of list) log(`- ${t.name} slug=${t.slug} id=${t.id}`);
}

const qs = team ? `?teamId=${encodeURIComponent(team)}&limit=100` : "?limit=100";
const projects = await api(`/v9/projects${qs}`);
log("");
log("#### Projects");
if (projects.status !== 200) {
  log(`- lookup failed status=${projects.status} body=${JSON.stringify(projects.body).slice(0, 400)}`);
} else {
  const list = projects.body.projects || [];
  log(`count: ${list.length}`);
  for (const p of list) {
    const dqs = team ? `?teamId=${encodeURIComponent(team)}` : "";
    const domains = await api(`/v9/projects/${p.id}/domains${dqs}`);
    let names = "domains_error";
    if (domains.status === 200) {
      names = (domains.body.domains || []).map((d) => d.name).join(", ");
    } else {
      names = `err status=${domains.status}`;
    }
    log(`- ${p.name}`);
    log(`  id: ${p.id}`);
    log(`  framework: ${p.framework}`);
    log(`  domains: [${names}]`);
    log(`  crons: ${JSON.stringify(p.crons ?? null)}`);
    log(`  updatedAt: ${p.updatedAt}`);
  }
}

if (team) {
  const domains = await api(`/v5/domains?teamId=${encodeURIComponent(team)}&limit=50`);
  log("");
  log("#### Team domains");
  if (domains.status !== 200) {
    log(`- lookup failed status=${domains.status}`);
  } else {
    const list = domains.body.domains || [];
    if (!list.length) log("(none)");
    for (const d of list) log(`- ${d.name} verified=${d.verified}`);
  }
}
