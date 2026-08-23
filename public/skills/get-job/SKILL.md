---
name: get-job
description: Fetch full detail and apply URL for one curated job on CVin.Bio.
version: 1.0.0
---

# Get Job Details Skill — CVin.Bio

Fetch complete listing details, company metadata, and canonical apply URLs for a specific job on CVin.Bio.

## When to use
Use this skill when you have a job ID or slug and need the full description, salary range, or apply link.

## Invocation

### Option 1: MCP Tool
- **Tool name**: `get_job`
- **Arguments**: `{"id": "<job-uuid-or-slug>"}`

### Option 2: REST API
- **Endpoint**: `GET https://cvin.bio/api/jobs/<job-id>`
- **Headers**: `Accept: application/json`
