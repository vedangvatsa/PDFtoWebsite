/**
 * Shared authentication utility functions.
 * Maps Supabase auth error messages to user-friendly descriptions.
 */

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
  if (m.includes('user not found') || m.includes('no user'))
    return 'No account found with this email.';
  if (m.includes('user banned') || m.includes('disabled'))
    return 'This account has been disabled. Contact support.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Network error. Check your connection and try again.';
  if (m.includes('popup'))
    return 'Sign-in popup was blocked or closed. Please try again.';
  if (m.includes('signup is disabled') || m.includes('signups not allowed'))
    return 'New signups are currently disabled. Please try again later.';

  // Fallback: show the actual Supabase error so it is never hidden from the user
  return msg || 'Something went wrong. Please try again.';
}
