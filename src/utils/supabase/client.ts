import { createBrowserClient } from '@supabase/ssr'

const profileAwareFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (typeof window !== 'undefined' && response.ok && url.pathname === '/rest/v1/profiles' && ['POST', 'PATCH', 'DELETE'].includes(method)) {
    // All editor saves, including autosave and rename, pass through this
    // client. Invalidate after the committed write and before resolving save.
    // Session cookies authenticate this same-origin request.
    try {
      const invalidated = await fetch('/api/cache/profile', { method: 'POST', credentials: 'same-origin' });
      if (!invalidated.ok) console.warn('Profile cache refresh pending');
    } catch {
      // The write succeeded; a transient refresh failure expires within 5 min.
      console.warn('Profile cache refresh pending');
    }
  }
  return response;
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: profileAwareFetch } }
  )
}
