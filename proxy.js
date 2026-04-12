import { NextResponse } from 'next/server';
import { createProxyClient } from '@/lib/supabase/proxy';

// Next.js 16 renamed middleware to proxy. This runs before every matched
// request and refreshes the Supabase session cookie so downstream Server
// Components see a valid token. It also performs a *cheap* redirect for
// unauthenticated users hitting /portal or /admin — the real authorization
// check still lives in the DAL on each page (see src/lib/dal.js).
//
// Per the bundled Next.js docs: "Proxy is not intended for... full session
// management or authorization" — keep this file fast and non-definitive.

export async function proxy(request) {
  const { supabase, response } = createProxyClient(request);

  // This call triggers token refresh if needed, which writes new cookies onto
  // the outgoing response via the setAll() callback wired in createProxyClient.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith('/portal') || pathname.startsWith('/admin');

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // If an authenticated user hits /login or /signup, bounce them to their
  // landing page. We don't know their role here without a DB hit, so we
  // redirect to /portal and let the DAL in the portal layout decide whether to
  // kick an admin over to /admin.
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/portal/dashboard';
    return NextResponse.redirect(url);
  }

  return response();
}

export const config = {
  matcher: [
    // Run on everything except static assets and image optimization.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
};
