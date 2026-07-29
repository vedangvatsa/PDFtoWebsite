import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared Supabase admin client for server-side API routes.
 * Uses the service role key when available, falls back to anon key.
 *
 * Import this instead of creating a new client in every API route.
 *
 * Lazy-init so Cloudflare Worker secrets are read at request time
 * (module top-level env can be empty during some build/bundling paths).
 * Rejects placeholder values like "[SENSITIVE]" that Vercel pull sometimes leaves behind.
 */
function resolveKey(): string {
  const candidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ];
  for (const raw of candidates) {
    const key = (raw || '').trim();
    if (!key) continue;
    if (/^\[?SENSITIVE\]?$/i.test(key)) continue;
    if (key.length < 20) continue;
    return key;
  }
  throw new Error(
    'Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) on the Worker'
  );
}

function resolveUrl(): string {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  return url;
}

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    _client = createClient(resolveUrl(), resolveKey());
  }
  return _client;
}

/** @deprecated Prefer getSupabaseAdmin() so secrets resolve at request time */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
