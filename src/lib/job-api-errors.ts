/** A failed read must never masquerade as a missing job or the last board page. */
export function jobDataUnavailableResponse(extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('CDN-Cache-Control', 'no-store');
  headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
  headers.set('Retry-After', '30');
  return Response.json({
    error: 'Job data is temporarily unavailable.',
    code: 'DATABASE_UNAVAILABLE',
    hint: 'Retry the same URL and pagination cursor after 30 seconds.',
  }, { status: 503, headers });
}
