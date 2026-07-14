import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const forwardedHost = request.headers.get('x-forwarded-host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  
  let origin = forwardedHost ? `${protocol}://${forwardedHost}` : requestUrl.origin
  if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    origin = origin.replace('http://', 'https://')
  }

  // 1. Check for error parameters from Supabase / OAuth provider
  const authError = searchParams.get('error')
  const authErrorDescription = searchParams.get('error_description')
  if (authError) {
    console.error('Auth callback error parameter:', authError, authErrorDescription)
    return NextResponse.redirect(`${origin}/signup?error=auth&message=${encodeURIComponent(authErrorDescription || authError)}`)
  }

  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  
  // Validate 'next' param to prevent open redirect (e.g., //evil.com)
  const rawNext = searchParams.get('next') ?? '/editor'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/editor'

  // Handle standard PKCE code exchange
  if (code) {
    const cookieStore = await cookies()
    const redirectUrl = `${origin}${next}`
    const response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
    console.error('exchangeCodeForSession error:', error)
    return NextResponse.redirect(`${origin}/signup?error=auth&message=${encodeURIComponent(error.message)}`)
  }

  // Handle OTP / Magic Link token verification
  if (tokenHash && type) {
    const cookieStore = await cookies()
    const redirectUrl = `${origin}${next}`
    const response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    })

    if (!error) {
      return response
    }
    console.error('verifyOtp error:', error)
    return NextResponse.redirect(`${origin}/signup?error=auth&message=${encodeURIComponent(error.message)}`)
  }

  // If no code and no token_hash is provided, redirect to signup with error
  return NextResponse.redirect(`${origin}/signup?error=auth&message=No+code+or+token+provided`)
}
