"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { GoogleIcon } from '@/components/google-icon';
import { EMAIL_OTP_LENGTH, friendlyAuthError, normalizeEmailOtp } from '@/lib/auth-utils';
import { createClient } from '@/utils/supabase/client';
import { Mail } from 'lucide-react';
import posthog from 'posthog-js';
import { AUTH_EVENTS } from '@/lib/posthog-events';

function emailRedirectTo(): string {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://cvin.bio');
  return `${origin}/auth/callback?next=${encodeURIComponent('/editor')}&auth_method=email_link`;
}

export function LoginDialog({ trigger }: { trigger?: React.ReactNode } = {}) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: emailRedirectTo(),
      },
    });
    if (error) {
      posthog.capture(AUTH_EVENTS.MAGIC_LINK_FAILED, { error: error.message, from: 'login_dialog' });
      toast({ variant: 'destructive', title: 'Error', description: friendlyAuthError(error.message) });
    } else {
      posthog.capture(AUTH_EVENTS.MAGIC_LINK_SENT, { from: 'login_dialog' });
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
    let lastError: { message: string } | null = null;
    for (const type of ['email', 'signup', 'magiclink'] as const) {
      const { error } = await supabase.auth.verifyOtp({ email, token, type });
      if (!error) {
        // auth_completed is fired once by AuthMethodTracker via ?auth_method=otp
        posthog.capture(AUTH_EVENTS.OTP_VERIFIED, { from: 'login_dialog' });
        setOpen(false);
        router.push('/editor?auth_method=otp');
        return;
      }
      lastError = error;
      if (error.message.toLowerCase().includes('expired')) break;
    }
    posthog.capture(AUTH_EVENTS.MAGIC_LINK_FAILED, {
      error: lastError?.message || 'verify_failed',
      is_otp: true,
      from: 'login_dialog',
    });
    toast({
      variant: 'destructive',
      title: 'Invalid code',
      description: friendlyAuthError(lastError?.message || '') || 'Invalid or expired code.',
    });
    setIsVerifying(false);
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    posthog.capture(AUTH_EVENTS.GOOGLE_CLICKED, { from: 'login_dialog' });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/editor')}&auth_method=google`,
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEmailSent(false);
      setEmail('');
      setCode('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <button className="underline hover:text-primary">Sign in</button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Sign In to CVin.Bio</DialogTitle>
        </DialogHeader>

        {emailSent ? (
          <div className="grid gap-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="grid gap-1">
              <h3 className="text-lg font-semibold">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                Enter the {EMAIL_OTP_LENGTH}-digit code we sent to{' '}
                <span className="font-medium text-foreground">{email}</span>, or open the sign-in link
                in that email.
              </p>
            </div>
            <form onSubmit={handleVerifyCode} className="grid gap-3 mt-1">
              <Input
                id="dialog-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={'0'.repeat(EMAIL_OTP_LENGTH)}
                required
                value={code}
                onChange={(e) => setCode(normalizeEmailOtp(e.target.value))}
                className="text-center text-lg tracking-widest h-12"
                maxLength={EMAIL_OTP_LENGTH}
              />
              <Button type="submit" className="w-full" disabled={isVerifying || code.length < EMAIL_OTP_LENGTH}>
                {isVerifying ? <Icons.logo className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isVerifying ? 'Verifying...' : 'Verify code'}
              </Button>
            </form>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setCode('');
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
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
                <Label htmlFor="dialog-email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="dialog-email"
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
              No password. Code + one-tap link in the email.
            </p>

            <p className="text-[11px] text-center text-muted-foreground px-2">
              By continuing, you agree to our{' '}
              <a href="/terms" target="_blank" className="underline hover:text-foreground">
                terms
              </a>
              .
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
