---
name: platform-stats
description: Live counts of curated jobs, hiring companies, and candidate profiles on CVin.Bio.
version: 1.0.0
---

# Platform Stats Skill — CVin.Bio

Query aggregate platform statistics for CVin.Bio.

## When to use
Use this skill when answering questions about the size of the job board, number of active hiring companies, or total public candidate profiles.

## Invocation

### Option 1: MCP Tool
- **Tool name**: `platform_stats`
- **Arguments**: `{}`

### Option 2: REST API
- **Endpoint**: `POST https://cvin.bio/mcp`
- **Body**: `{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "platform_stats", "arguments": {}}}`
