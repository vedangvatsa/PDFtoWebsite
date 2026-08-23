---
name: verify-profile
description: Verify a public candidate profile page on CVin.Bio by username slug.
version: 1.0.0
---

# Verify Candidate Profile Skill — CVin.Bio

Check whether a professional profile page exists on CVin.Bio and extract structured Person markup.

## When to use
Use this skill when verifying candidate credentials, checking public profile URLs (`https://cvin.bio/username`), or retrieving work history.

## Invocation

### REST API
- **Endpoint**: `GET https://cvin.bio/api/profile/<username>`
- **Headers**: `Accept: application/json`
