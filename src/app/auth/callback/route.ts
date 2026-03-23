import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Validate 'next' param to prevent open redirect (e.g., //evil.com)
  const rawNext = searchParams.get('next') ?? '/editor'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/editor'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If code exchange fails, redirect to signup with an error hint
  return NextResponse.redirect(`${origin}/signup?error=auth`)
}
