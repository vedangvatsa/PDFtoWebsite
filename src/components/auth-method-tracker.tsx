'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { AUTH_EVENTS } from '@/lib/posthog-events';

/**
 * Fires auth_completed when the user lands with ?auth_method= after
 * email-link or OAuth callback, then strips the param from the URL.
 * Mount once in the root layout (client island) or editor/signup pages.
 */
export function AuthMethodTracker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    const method = searchParams.get('auth_method');
    if (!method) return;
    fired.current = true;

    posthog.capture(AUTH_EVENTS.COMPLETED, {
      method,
      page: pathname || '/',
    });

    // Strip tracking param so refresh doesn't double-count
    const params = new URLSearchParams(searchParams.toString());
    params.delete('auth_method');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}
