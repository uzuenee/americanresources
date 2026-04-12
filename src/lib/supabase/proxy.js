import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Creates a Supabase client for use inside proxy.js (Next.js 16's renamed
// middleware). The two-response-object dance is required: we build a
// NextResponse up front, hand its cookie API to Supabase so refreshed tokens
// land on the outgoing response, and return the same response object from the
// caller.
export function createProxyClient(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Reset the response so newly-set cookies are reflected on both the
          // forwarded request and the final response.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response: () => response };
}
