'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'
import { useUser } from '@/auth'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      }
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      {children}
    </PHProvider>
  )
}

/** Identify logged-in users so PostHog links events to a person */
function PostHogIdentify() {
  const { user } = useUser()
  const ph = usePostHog()

  useEffect(() => {
    if (user && ph) {
      ph.identify(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name,
        provider: user.app_metadata?.provider,
      })
    }
  }, [user, ph])

  return null
}
