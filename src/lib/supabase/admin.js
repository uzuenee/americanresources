import 'server-only';

import { createClient } from '@supabase/supabase-js';

// Service-role Supabase client. NEVER import from a Client Component or any
// file that ends up in the browser bundle — `server-only` enforces this at
// build time. Used exclusively for `auth.admin.*` calls (generateLink, etc.)
// where we need to bypass RLS and Supabase's own mailer.

let cached;

export function createAdminClient() {
  if (cached) return cached;
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
  return cached;
}
