import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Data Access Layer. Every Server Component / Server Action / Route Handler
// that needs an authenticated user should call one of these. verifySession() is
// memoized per React render pass via cache() so parent layouts and child pages
// share a single auth check in the same request.
//
// We always use getUser() (not getSession()) because getSession() pulls the
// user object straight out of the cookie without contacting the Auth server —
// which means a malicious client could spoof claims. See
// @supabase/ssr README "getSession() vs getUser()".

export const verifySession = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, customer_id, full_name, phone, title, avatar_url')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return { user, profile };
});

export async function requireSession() {
  const session = await verifySession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requireCustomer() {
  const session = await requireSession();
  if (session.profile.role !== 'customer' || !session.profile.customer_id) {
    redirect('/forbidden');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.profile.role !== 'admin') {
    redirect('/forbidden');
  }
  return session;
}
