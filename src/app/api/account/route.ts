import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/utils/supabase/server';

export async function DELETE() {
  try {
    // 1. Verify the user is authenticated via their session cookie
    const supabaseUser = await createClient();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Delete profile row using the user's active session (relies on RLS allowing delete self)
    const { error: profileDeleteError } = await supabaseUser
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileDeleteError) {
      console.error('Profile deletion failed:', profileDeleteError);
      return NextResponse.json({ error: profileDeleteError.message }, { status: 500 });
    }

    // 3. Delete auth user (requires service role)
    // If the service role key is not configured (e.g., in some deployment environments),
    // we skip deleting the Auth user, meaning they can still log in but will have a fresh empty profile.
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error('Auth user deletion failed:', authDeleteError);
      // Profile is already deleted — surface the partial failure instead of
      // silently reporting a clean success.
      return NextResponse.json({
        success: true,
        partial: true,
        warning: 'Profile deleted, but the account could not be fully removed. Contact support if you need help.',
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, partial: false }, { status: 200 });
  } catch (error) {
    console.error('Account deletion error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
