'use client';

import { createContext, useContext, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// PortalAuthContext is now a thin read-only pipe for session data computed on
// the server by the portal/admin Server Component layouts (see requireCustomer
// / requireAdmin in src/lib/dal.js). The server is authoritative — this
// context exists only so client components deep in the shell (sidebar,
// header, contact modal) don't have to prop-drill.
//
// Shape:
//   session.user      = { id, name, email, role, customerId, title, avatar }
//   session.customer  = the full customer row (or null for admins)
//   session.recentActivity = last 5 activity rows, pre-joined with company name

const PortalAuthContext = createContext(null);

export function PortalAuthProvider({ initialSession, children }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const signOut = async () => {
    // Sign out on the browser side too so any realtime subscriptions the
    // client client may hold tear down, then bounce to /login. The server
    // cookie is cleared the next time a Server Component runs — proxy.js
    // forwards everyone without a session to /login anyway.
    const supabase = createClient();
    await supabase.auth.signOut();
    startTransition(() => {
      router.replace('/login');
      router.refresh();
    });
  };

  const value = {
    session: initialSession,
    user: initialSession?.user ?? null,
    role: initialSession?.user?.role ?? null,
    customer: initialSession?.customer ?? null,
    recentActivity: initialSession?.recentActivity ?? [],
    hydrated: true,
    signOut,
  };

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider');
  }
  return ctx;
}
