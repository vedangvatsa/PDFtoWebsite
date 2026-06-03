import { createClient } from '@supabase/supabase-js';

/**
 * Shared Supabase admin client for server-side API routes.
 * Uses the service role key when available, falls back to anon key.
 * 
 * Import this instead of creating a new client in every API route.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
