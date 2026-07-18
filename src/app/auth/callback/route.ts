import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

const OTP_TYPES = new Set<string>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
])

function safeNextPath(raw: string | null): string {
  const next = raw ?? '/editor'
  return next.startsWith('/') && !next.startsWith('//') ? next : '/editor'
}

function withAuthMethod(path: string, method: string | null): string {
  if (!method) return path
  const [base, qs] = path.split('?')
  const params = new URLSearchParams(qs || '')
  if (!params.has('auth_method')) params.set('auth_method', method)
  const q = params.toString()
  return q ? `${base}?${q}` : base
}

function createCookieSupabase(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          } catch (err) {
            console.warn('cookieStore.set failed in auth callback:', err)
          }
        },
      },
    }
  )
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const forwardedHost = request.headers.get('x-forwarded-host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'

  let origin = forwardedHost ? `${protocol}://${forwardedHost}` : requestUrl.origin
  const isLocal =
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('.local') ||
    origin.includes('192.168.') ||
    origin.includes('10.') ||
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./.test(origin)
  if (!isLocal) {
    origin = origin.replace('http://', 'https://')
  }

  // 1. Errors from Supabase / OAuth provider
  const authError = searchParams.get('error')
  const authErrorDescription = searchParams.get('error_description')
  if (authError) {
    console.error('Auth callback error parameter:', authError, authErrorDescription)
    return NextResponse.redirect(
      `${origin}/signup?error=auth&message=${encodeURIComponent(authErrorDescription || authError)}`
    )
  }

  const code = searchParams.get('code')
  // Support both token_hash (preferred, cross-device) and legacy token param names
  const tokenHash =
    searchParams.get('token_hash') ||
    searchParams.get('token') ||
    searchParams.get('hashed_token')
  const typeParam = searchParams.get('type')
  const authMethodHint = searchParams.get('auth_method') // set by us in redirect URLs / email templates

  const next = safeNextPath(searchParams.get('next'))

  // 2. Prefer token_hash verification — works in any browser/device (no PKCE cookie).
  if (tokenHash) {
    const typesToTry: EmailOtpType[] = []
    if (typeParam && OTP_TYPES.has(typeParam)) {
      typesToTry.push(typeParam as EmailOtpType)
    } else {
      // Templates sometimes omit type; try common ones in order.
      typesToTry.push('email', 'magiclink', 'signup')
    }

    const cookieStore = await cookies()
    const method = authMethodHint || 'email_link'
    const redirectUrl = `${origin}${withAuthMethod(next, method)}`
    const response = NextResponse.redirect(redirectUrl)
    const supabase = createCookieSupabase(cookieStore, response)

    let lastError: { message: string } | null = null
    for (const type of typesToTry) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      })
      if (!error) {
        return response
      }
      lastError = error
      // Don't retry if token is clearly dead
      const msg = error.message.toLowerCase()
      if (msg.includes('expired') || msg.includes('invalid')) {
        break
      }
    }

    console.error('verifyOtp (token_hash) error:', lastError)
    return NextResponse.redirect(
      `${origin}/signup?error=auth&message=${encodeURIComponent(lastError?.message || 'Invalid or expired link')}`
    )
  }

  // 3. PKCE code exchange (Google OAuth, or default ConfirmationURL if still PKCE)
  if (code) {
    const cookieStore = await cookies()
    // Default: oauth when no hint (Google). Email PKCE links should prefer token_hash templates.
    const method = authMethodHint || 'oauth'
    const redirectUrl = `${origin}${withAuthMethod(next, method)}`
    const response = NextResponse.redirect(redirectUrl)
    const supabase = createCookieSupabase(cookieStore, response)

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }

    console.error('exchangeCodeForSession error:', error)
    const msg = error.message || 'Authentication failed'
    // PKCE verifier missing = user opened the link in a different browser/app
    if (/verifier|pkce/i.test(msg)) {
      return NextResponse.redirect(
        `${origin}/signup?error=auth&message=${encodeURIComponent(
          'Sign-in link must be opened in the same browser where you started — or enter the code from the email instead.'
        )}`
      )
    }
    return NextResponse.redirect(
      `${origin}/signup?error=auth&message=${encodeURIComponent(msg)}`
    )
  }

  return NextResponse.redirect(
    `${origin}/signup?error=auth&message=${encodeURIComponent('No code or token provided')}`
  )
}
