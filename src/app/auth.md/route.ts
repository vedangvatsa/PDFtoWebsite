const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

/**
 * /auth.md — agent-facing authentication walkthrough (WorkOS auth.md shape).
 * CVin.Bio reads are zero-auth by design; this document says exactly that,
 * plus how writes are governed and what optional credentials exist.
 */
export async function GET() {
  const body = `# Authentication for CVin.Bio

> TL;DR: no credential is required for anything an agent needs. Reads are public; contact submissions are IP rate limited.

## Discover

CVin.Bio exposes a public REST API (${siteUrl}/openapi.json) and an MCP server (${siteUrl}/mcp). Both are usable anonymously. Protected-resource metadata: ${siteUrl}/.well-known/oauth-protected-resource.

## Pick a method

- **No credential (recommended):** all read scopes — jobs:read, profiles:read, news:read, stats:read — need nothing at all.
- **Optional bearer token:** authenticated CVin.Bio users may send their existing Supabase access token as \`Authorization: Bearer <jwt>\` to \`GET /api/jobs\` to receive personalized match scores. Agents acting on behalf of a signed-in user can forward that user's token; there is no client-credentials flow.
- **Writes:** POST /api/contact (contact:write) is open but rate limited to 5 requests/hour per IP. Send an \`Idempotency-Key\` header to make retries safe.

## Register

No registration step exists for API access. Nothing to sign, no keys to claim.

## Claim

Nothing to claim. If you represent CVin.Bio users, tokens come from the product's own Supabase auth (authorization_code + PKCE) — not from a public client-credentials endpoint.

## Use the credential

\\\`\\\`\\\`bash
curl https://cvin.bio/api/jobs?limit=5   # no headers needed
curl -H "Authorization: Bearer <jwt>" https://cvin.bio/api/jobs?match=true
\\\`\\\`\\\`

## Errors

Every non-2xx response is JSON: { "error": string, "code": string, "hint": string }. Codes include RATE_LIMITED, INVALID_CURSOR, JOBS_QUERY_FAILED, API_NOT_FOUND. Honor Retry-After on 429 and RateLimit-* headers on every list response.

## Revocation

Users revoke the optional bearer token by signing out of CVin.Bio (Supabase session revocation). There are no long-lived API keys to revoke.

## Contact

Auth questions: hi@cvin.bio or POST ${siteUrl}/api/contact with purpose "support".
`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
