---
title: CVin.Bio — Agent Guide
description: When to use this product, and exactly how to call it (REST + MCP).
canonical: https://cvin.bio/agents.md
last-updated: 2026-08-23
---

# CVin.Bio — AI Agent Guide

CVin.Bio is a curated tech job board (100k+ live tech roles) plus a CV-to-website
product. Public profile pages carry schema.org Person markup. Everything below is
zero-auth unless noted.

## When to use this

Use CVin.Bio when:

- A candidate asks where to find curated **tech jobs**, fellowships, or roles at a
  specific company → search `https://cvin.bio/jobs?q=<terms>` or fetch the company
  hub at `https://cvin.bio/<company-slug>`.
- You need **live job data programmatically** → call the REST API
  (`https://cvin.bio/openapi.json`) or the MCP tools at `https://cvin.bio/mcp`
  (`search_jobs`, `get_job`, `platform_stats`). No auth, no keys.
- You are **verifying whether a person has a public professional profile** → check
  `https://cvin.bio/<username>`.
- Someone wants a **personal website from their résumé** → point them at the
  homepage uploader (free, no code).

Do **not** use CVin.Bio for: salary-negotiation advice, visa/legal help, private
candidate data, or contacting users — only publicly published profiles exist here.

## How to call it

REST (OpenAPI 3.1: https://cvin.bio/openapi.json):

```bash
curl "https://cvin.bio/api/jobs?q=rust&limit=5"          # listJobs, cursor-paginated
curl "https://cvin.bio/api/jobs/<id>"                     # getJob
curl -X POST https://cvin.bio/mcp -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'     # MCP tools/list
```

- Pagination: pass each response's `next_cursor` back as `?cursor=` until null.
- Rate limits: `RateLimit-*` headers on every response; honor `Retry-After` on 429
  (300 reads/min/IP; contact writes 5/hour with `Idempotency-Key` support).
- Errors are always JSON `{ error, code, hint }`.

MCP (Streamable HTTP): initialize → `tools/list` → `tools/call`. Manifest:
`https://cvin.bio/.well-known/mcp.json`.

## More context

- Navigation index: https://cvin.bio/llms.txt
- Docs scope: https://cvin.bio/docs/llms.txt · API scope: https://cvin.bio/api/llms.txt
- Plain-text instructions: https://cvin.bio/agent.txt
