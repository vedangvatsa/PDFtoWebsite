'use client'

import Clarity from '@microsoft/clarity'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useUser } from '@/auth'

function isBotOrHeadless(): boolean {
  try {
    if (typeof navigator !== 'undefined' && navigator.webdriver === true) return true
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
    if (ua && /bot|crawl|spider|slurp|lighthouse|headless|phantom|puppeteer|playwright|selenium|htmlunit|scrapy|heritrix/i.test(ua)) {
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}

function clarityReady(): boolean {
  return typeof window !== 'undefined' && typeof (window as Window & { clarity?: unknown }).clarity === 'function'
}

export function ClarityProvider({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
  const { user } = useUser()
  const pathname = usePathname()

  useEffect(() => {
    if (!projectId || isBotOrHeadless()) return
    Clarity.init(projectId)
    // Terms treat continued use as analytics consent; no ad storage.
    Clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'granted' })
  }, [projectId])

  useEffect(() => {
    if (!projectId || !user || !clarityReady()) return
    const name =
      typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined
    Clarity.identify(user.id, undefined, undefined, name)
    Clarity.setTag('auth', 'signed-in')
    const provider = user.app_metadata?.provider
    if (typeof provider === 'string' && provider) Clarity.setTag('auth_provider', provider)
  }, [projectId, user])

  useEffect(() => {
    if (!projectId || !pathname || !clarityReady()) return
    Clarity.setTag('route', pathname)
  }, [projectId, pathname])

  return <>{children}</>
}
