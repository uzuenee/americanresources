import 'server-only';

import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function getLoginRedirectUrl() {
  try {
    const h = await headers();
    const currentPath =
      h.get('x-invoke-path') ||
      h.get('x-matched-path') ||
      '';
    if (currentPath && currentPath !== '/login' && currentPath !== '/') {
      return `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  } catch {
    // headers() may not be available in all contexts
  }
  return '/login';
}

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
    .select('id, role, customer_id, full_name, phone, title, avatar_url, customers(status)')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    user,
    profile: {
      ...profile,
      customerStatus: profile.customers?.status ?? null,
      customers: undefined,
    },
  };
});

export async function requireSession() {
  const session = await verifySession();
  if (!session) {
    const loginUrl = await getLoginRedirectUrl();
    redirect(loginUrl);
  }
  return session;
}

export async function requireCustomer() {
  const session = await requireSession();
  if (session.profile.role !== 'customer' || !session.profile.customer_id) {
    redirect('/forbidden');
  }
  if (session.profile.customerStatus === 'pending') {
    redirect('/pending-approval');
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
