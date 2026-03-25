'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import { useUser } from '@/auth'
import { usePathname, useSearchParams } from 'next/navigation'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',

      // ── Pageview & navigation ──
      capture_pageview: false,        // We handle manually for SPA accuracy
      capture_pageleave: true,

      // ── Session replay ──
      session_recording: {
        maskAllInputs: false,         // Show typed content (no passwords)
        maskInputOptions: { password: true, email: false },
      },

      // ── Autocapture ──
      autocapture: {
        dom_event_allowlist: ['click', 'submit', 'change'],
        element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea'],
        css_selector_allowlist: ['[data-ph-capture]'],
      },

      // ── Performance ──
      capture_performance: true,      // Web vitals (LCP, FID, CLS)

      // ── Privacy ──
      respect_dnt: false,              // Track everyone (small product)
      sanitize_properties: (props, event) => {
        // Redact email from URLs if present
        if (props['$current_url']) {
          props['$current_url'] = props['$current_url'].replace(/email=[^&]+/g, 'email=REDACTED');
        }
        return props;
      },

      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      }
    })

    // ── Global error tracking ──
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        posthog.capture('$exception', {
          $exception_message: event.message,
          $exception_source: event.filename,
          $exception_lineno: event.lineno,
          $exception_colno: event.colno,
          $exception_type: 'Error',
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        posthog.capture('$exception', {
          $exception_message: event.reason?.message || String(event.reason),
          $exception_type: 'UnhandledPromiseRejection',
        })
      })
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  )
}

/** Identify logged-in users with rich properties */
function PostHogIdentify() {
  const { user } = useUser()
  const ph = usePostHog()

  useEffect(() => {
    if (user && ph) {
      ph.identify(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider,
        created_at: user.created_at,
      })

      // Set super properties that attach to every event
      ph.register({
        user_provider: user.app_metadata?.provider || 'unknown',
        user_email_domain: user.email?.split('@')[1] || 'unknown',
      })
    }
  }, [user, ph])

  return null
}

/** Track pageviews on route changes (SPA-accurate) */
function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname
      const search = searchParams?.toString()
      if (search) url += '?' + search
      ph.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams, ph])

  return null
}
