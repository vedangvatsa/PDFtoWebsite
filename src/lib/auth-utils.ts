/**
 * Shared authentication utility functions.
 * Maps Supabase auth error messages to user-friendly descriptions.
 */

/**
 * Supabase Auth email OTP length for this project (GoTrue mailer OTP).
 * Must match Auth → Email → OTP length in the Supabase dashboard and
 * the digits shown in "Your CVin.Bio Login Code" emails. Do not set the
 * UI maxLength lower than this — users cannot verify a truncated code.
 */
export const EMAIL_OTP_LENGTH = 8;

/** Keep only digits and cap to EMAIL_OTP_LENGTH for the OTP input. */
export function normalizeEmailOtp(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, EMAIL_OTP_LENGTH);
}

export function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase();

  if (m.includes('invalid login credentials'))
    return 'Incorrect email or password. Please try again.';
  if (m.includes('email not confirmed'))
    return 'Please check your inbox and confirm your email before signing in.';
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (m.includes('password') && (m.includes('short') || m.includes('at least')))
    return 'Password must be at least 6 characters.';
  if (m.includes('valid email') || m.includes('invalid email') || m.includes('unable to validate'))
    return 'Please enter a valid email address.';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('exceeded'))
    return 'Too many attempts. Please wait a moment and try again.';
  // OTP / magic-link token failures (check before generic "disabled")
  if (
    m.includes('token has expired') ||
    m.includes('otp has expired') ||
    (m.includes('token') && m.includes('invalid')) ||
    m.includes('invalid otp')
  ) {
    return `That code is invalid or has expired. Enter the full ${EMAIL_OTP_LENGTH}-digit code from your latest email, or request a new one.`;
  }
  if (m.includes('email link is invalid') || (m.includes('email link') && m.includes('expired')))
    return 'That sign-in link is invalid or has expired. Request a new code and try again.';
  if (m.includes('pkce') || m.includes('code verifier'))
    return 'Sign-in link must be opened in the same browser where you started. Prefer entering the code from the email instead.';
  if (m.includes('user not found') || m.includes('no user'))
    return 'No account found with this email.';
  if (m.includes('user banned') || (m.includes('disabled') && !m.includes('signup')))
    return 'This account has been disabled. Contact support.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Network error. Check your connection and try again.';
  if (m.includes('popup'))
    return 'Sign-in popup was blocked or closed. Please try again.';
  if (m.includes('signup is disabled') || m.includes('signups not allowed'))
    return 'New signups are currently disabled. Please try again later.';
  if (m.includes('sending confirmation') || m.includes('confirmation email'))
    return 'Unable to send confirmation email. This is usually due to a mail server rate-limit or configuration error. Please try again later.';

  // Fallback: show the actual Supabase error so it is never hidden from the user
  return msg || 'Something went wrong. Please try again.';
}
