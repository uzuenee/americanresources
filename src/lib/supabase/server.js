import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Server client for use in Server Components, Server Actions, and Route
// Handlers. Next.js 16 requires `cookies()` to be awaited. Server Components
// cannot set cookies (only read); we swallow the write error there because the
// proxy.js handles session refresh on each navigation.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookies are read-only there.
            // The proxy refreshes the session on every navigation so this is
            // fine to ignore.
          }
        },
      },
    }
  );
}
