'use client';

import { createBrowserClient } from '@supabase/ssr';

// Browser client. Safe to call from 'use client' components. Reads/writes the
// session cookie via document.cookie — used for things the user triggers in the
// browser (e.g. signOut, realtime subscriptions). Most data reads should go
// through the server client in src/lib/supabase/server.js instead.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
