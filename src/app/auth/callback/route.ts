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

  const code = searchParams.get('code')
  // Validate 'next' param to prevent open redirect (e.g., //evil.com)
  const rawNext = searchParams.get('next') ?? '/editor'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/editor'

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

  // If code exchange fails, redirect to signup with an error hint
  return NextResponse.redirect(`${origin}/signup?error=auth&message=No+code+provided`)
}
