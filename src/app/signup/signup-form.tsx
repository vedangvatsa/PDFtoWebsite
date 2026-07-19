'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { GoogleIcon } from '@/components/google-icon';
import { EMAIL_OTP_LENGTH, friendlyAuthError, isInAppBrowser, normalizeEmailOtp } from '@/lib/auth-utils';
import { useUser } from '@/auth';
import { createClient } from '@/utils/supabase/client';
import { Mail, AlertTriangle, ExternalLink } from 'lucide-react';
import posthog from 'posthog-js';
import { AUTH_EVENTS } from '@/lib/posthog-events';

function emailRedirectTo(): string {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://cvin.bio');
  // auth_method is preserved through callback success redirects for analytics
  return `${origin}/auth/callback?next=${encodeURIComponent('/editor')}&auth_method=email_link`;
}

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const fromParam = searchParams.get('from');
  const errorParam = searchParams.get('error');
  const errorMsgParam = searchParams.get('message');
  const fromUpload = fromParam === 'upload';
  const fromManual = fromParam === 'manual';

  useEffect(() => {
    if (errorParam === 'auth') {
      const description = errorMsgParam
        ? friendlyAuthError(errorMsgParam)
        : 'Something went wrong during sign-in. Please try again.';
      toast({ variant: 'destructive', title: 'Sign-in failed', description });
    }
  }, [errorParam, errorMsgParam, toast]);

  useEffect(() => {
    if (!isUserLoading && user) {
      // Prefer staying on editor if already routed there with auth_method
      router.push('/editor');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const inApp = isInAppBrowser();
    if (!inApp) return;
    setInAppBrowser(true);

    // Auto-escape: try to open this URL in the system browser.
    // Many in-app browsers block window.open, so we try multiple strategies.
    const currentUrl = window.location.href;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    let escaped = false;

    if (isIOS) {
      // Try Safari first, then Chrome
      const safariUrl = currentUrl.replace(/^https?:\/\//, 'x-safari-https://');
      try {
        window.location.href = safariUrl;
        escaped = true;
      } catch {}
      if (!escaped) {
        const chromeUrl = currentUrl.replace(/^https?:\/\//, 'googlechrome://');
        try {
          window.location.href = chromeUrl;
          escaped = true;
        } catch {}
      }
    } else if (isAndroid) {
      // Android: use intent:// scheme to open in Chrome
      const intentUrl = currentUrl.replace(/^https?:\/\//, 'intent://') +
        '#Intent;scheme=https;action=android.intent.action.VIEW;end;';
      try {
        window.location.href = intentUrl;
        escaped = true;
      } catch {}
    }

    // Fallback: try window.open
    if (!escaped) {
      try {
        const w = window.open(currentUrl, '_blank', 'noopener,noreferrer');
        if (w) escaped = true;
      } catch {}
    }

    // Copy URL to clipboard as last resort
    try {
      navigator.clipboard?.writeText(currentUrl);
    } catch {}
  }, []);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Used by email templates that include {{ .RedirectTo }} / confirmation URL base
        emailRedirectTo: emailRedirectTo(),
      },
    });
    if (error) {
      posthog.capture(AUTH_EVENTS.MAGIC_LINK_FAILED, { error: error.message, from: fromParam || 'direct' });
      toast({ variant: 'destructive', title: 'Error', description: friendlyAuthError(error.message) });
    } else {
      posthog.capture(AUTH_EVENTS.MAGIC_LINK_SENT, { from: fromParam || 'direct' });
      setEmailSent(true);
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = normalizeEmailOtp(code);
    if (token.length !== EMAIL_OTP_LENGTH) {
      toast({
        variant: 'destructive',
        title: 'Incomplete code',
        description: `Enter the full ${EMAIL_OTP_LENGTH}-digit code from your email.`,
      });
      return;
    }
    setIsVerifying(true);
    const supabase = createClient();

    // Try email then signup — new users often need type=signup after confirm templates
    let lastError: { message: string } | null = null;
    for (const type of ['email', 'signup', 'magiclink'] as const) {
      const { error } = await supabase.auth.verifyOtp({ email, token, type });
      if (!error) {
        // auth_completed is fired once by AuthMethodTracker via ?auth_method=otp
        posthog.capture(AUTH_EVENTS.OTP_VERIFIED, { from: fromParam || 'direct' });
        router.push('/editor?auth_method=otp');
        return;
      }
      lastError = error;
      const msg = error.message.toLowerCase();
      if (msg.includes('expired')) break;
    }

    posthog.capture(AUTH_EVENTS.MAGIC_LINK_FAILED, {
      error: lastError?.message || 'verify_failed',
      is_otp: true,
      from: fromParam || 'direct',
    });
    toast({
      variant: 'destructive',
      title: 'Invalid code',
      description:
        friendlyAuthError(lastError?.message || '') ||
        'The code you entered is invalid or has expired. Request a new one.',
    });
    setIsVerifying(false);
  };

  const openInExternalBrowser = () => {
    const url = window.location.href;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isIOS) {
      // Try Safari scheme
      try { window.location.href = url.replace(/^https?:\/\//, 'x-safari-https://'); return; } catch {}
      // Try Chrome scheme
      try { window.location.href = url.replace(/^https?:\/\//, 'googlechrome://'); return; } catch {}
    } else if (isAndroid) {
      // Android intent
      const intentUrl = url.replace(/^https?:\/\//, 'intent://') +
        '#Intent;scheme=https;action=android.intent.action.VIEW;end;';
      try { window.location.href = intentUrl; return; } catch {}
    }

    // Generic fallback
    try { navigator.clipboard?.writeText(url); } catch {}
    window.open(url, '_blank', 'noopener,noreferrer');
    toast({
      title: 'Opening in browser',
      description: 'If a new tab didn\'t open, tap the ••• menu in your current app and select "Open in Browser" or "Open in Safari".',
    });
  };

  const handleGoogleAuth = async () => {
    if (inAppBrowser) {
      toast({
        variant: 'destructive',
        title: 'Google sign-in blocked',
        description: 'Your current browser doesn\'t support Google sign-in. Tap "Open in Browser" below to continue.',
      });
      return;
    }
    setIsGoogleLoading(true);
    posthog.capture(AUTH_EVENTS.GOOGLE_CLICKED, { from: fromParam || 'direct' });
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/editor')}&auth_method=google`,
          skipBrowserRedirect: true,
        },
      });
      if (error) {
        posthog.capture(AUTH_EVENTS.GOOGLE_FAILED, { error: error.message });
        toast({ variant: 'destructive', title: 'Error', description: friendlyAuthError(error.message) });
        setIsGoogleLoading(false);
        return;
      }
      if (!data?.url) {
        posthog.capture(AUTH_EVENTS.GOOGLE_FAILED, { error: 'no_oauth_url' });
        toast({
          variant: 'destructive',
          title: 'Sign-in unavailable',
          description:
            'Could not start Google sign-in. Auth service may be down — try again in a few minutes or use email.',
        });
        setIsGoogleLoading(false);
        return;
      }
      window.location.assign(data.url);
    } catch (err) {
      console.error('Client-side Google Auth error:', err);
      posthog.capture(AUTH_EVENTS.GOOGLE_FAILED, {
        error: err instanceof Error ? err.message : String(err),
      });
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: err instanceof Error ? err.message : 'An unexpected error occurred during Google sign-in.',
      });
      setIsGoogleLoading(false);
    }
    setTimeout(() => setIsGoogleLoading(false), 10000);
  };

  if (emailSent) {
    return (
      <div className="grid gap-4 text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div className="grid gap-1 mb-2">
          <h3 className="text-lg font-semibold">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We sent an {EMAIL_OTP_LENGTH}-digit code to{' '}
            <span className="font-medium text-foreground">{email}</span>. Enter it below, or open the
            sign-in link in the same email (works on any device).
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="grid gap-3 mt-2">
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern={`[0-9]{${EMAIL_OTP_LENGTH}}`}
            placeholder={'0'.repeat(EMAIL_OTP_LENGTH)}
            required
            value={code}
            onChange={(e) => setCode(normalizeEmailOtp(e.target.value))}
            className="text-center text-lg tracking-widest h-12"
            maxLength={EMAIL_OTP_LENGTH}
            aria-label={`${EMAIL_OTP_LENGTH}-digit sign-in code`}
          />
          <Button type="submit" className="w-full" disabled={isVerifying || code.length < EMAIL_OTP_LENGTH}>
            {isVerifying ? <Icons.logo className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isVerifying ? 'Verifying...' : 'Verify code'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground px-1">
          Both options are in the email: type the code here, or tap the link. We track which people use more.
        </p>

        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-primary transition-colors mt-2"
          onClick={() => {
            setEmailSent(false);
            setEmail('');
            setCode('');
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {fromUpload && (
        <p className="text-sm text-center text-muted-foreground bg-accent/50 rounded-md p-2">
          Sign in to generate your profile from your resume.
        </p>
      )}
      {fromManual && (
        <p className="text-sm text-center text-muted-foreground bg-accent/50 rounded-md p-2">
          Sign in to build your profile and get a shareable link.
        </p>
      )}

      {inAppBrowser && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="grid gap-2 text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-200">
                Open in your browser to sign in
              </p>
              <p className="text-amber-800 dark:text-amber-300">
                Google sign-in doesn\'t work inside this app\'s built-in browser. Open this page in Safari or Chrome to continue.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-fit border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900"
                onClick={openInExternalBrowser}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open in Browser
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={handleGoogleAuth} disabled={isGoogleLoading}>
        {isGoogleLoading ? <Icons.logo className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or use email</span>
        </div>
      </div>

      <form onSubmit={handleSendEmail} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-xs">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Email me a code'}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        No password. We email an {EMAIL_OTP_LENGTH}-digit code and a one-tap sign-in link.
      </p>
    </div>
  );
}
