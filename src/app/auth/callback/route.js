import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Lands here after a user clicks the link in a signup-confirmation or
// password-reset email. We exchange the token_hash for a session (cookies are
// set via the SSR client) and redirect to the next page. Lives outside the
// (auth) route group so the AuthShell layout doesn't apply.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') || '/portal/dashboard';

  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL('/login?error=invalid_link', request.url)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    const url = new URL('/login', request.url);
    url.searchParams.set(
      'error',
      type === 'recovery' ? 'reset_expired' : 'confirm_expired'
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
