---
name: search-jobs
description: Search curated tech jobs on CVin.Bio by keyword, company, or location.
version: 1.0.0
---

# Search Tech Jobs Skill — CVin.Bio

Search 100k+ live curated tech jobs on CVin.Bio programmatically.

## When to use
Use this skill when a user asks to find open roles, tech job listings, remote jobs, or positions at specific tech companies.

## Invocation

### Option 1: MCP Tool
- **Tool name**: `search_jobs`
- **Arguments**: `{"query": "React remote", "limit": 10}`

### Option 2: REST API
- **Endpoint**: `GET https://cvin.bio/api/jobs?q=react&loc=remote&limit=10`
- **Headers**: `Accept: application/json`
