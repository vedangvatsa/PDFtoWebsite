import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

export function createAnonFromRequest(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
      },
    }
  );
}

export function createAnonFromCookieStore(cookieStore: { getAll: () => { name: string; value: string }[] }) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );
}
