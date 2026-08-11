'use client'

import { useEffect, useRef } from 'react'
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

function scheduleIdle(fn: () => void, timeoutMs: number): () => void {
  if (typeof window === 'undefined') return () => {}
  const ric = window.requestIdleCallback
  if (typeof ric === 'function') {
    const id = ric(() => fn(), { timeout: timeoutMs })
    return () => window.cancelIdleCallback?.(id)
  }
  const t = window.setTimeout(fn, Math.min(timeoutMs, 1200))
  return () => clearTimeout(t)
}

export function ClarityProvider({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
  const { user } = useUser()
  const pathname = usePathname()
  const booted = useRef(false)

  useEffect(() => {
    if (!projectId || isBotOrHeadless() || booted.current) return

    return scheduleIdle(() => {
      if (booted.current) return
      booted.current = true
      void import('@microsoft/clarity').then((Clarity) => {
        Clarity.default.init(projectId)
        // Terms treat continued use as analytics consent; no ad storage.
        Clarity.default.consentV2({ ad_Storage: 'denied', analytics_Storage: 'granted' })
      })
    }, 2500)
  }, [projectId])

  useEffect(() => {
    if (!projectId || !user || !clarityReady()) return
    void import('@microsoft/clarity').then((Clarity) => {
      const name =
        typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined
      Clarity.default.identify(user.id, undefined, undefined, name)
      Clarity.default.setTag('auth', 'signed-in')
      const provider = user.app_metadata?.provider
      if (typeof provider === 'string' && provider) Clarity.default.setTag('auth_provider', provider)
    })
  }, [projectId, user])

  useEffect(() => {
    if (!projectId || !pathname || !clarityReady()) return
    void import('@microsoft/clarity').then((Clarity) => {
      Clarity.default.setTag('route', pathname)
    })
  }, [projectId, pathname])

  return <>{children}</>
}
