'use client';

import { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import { m, useReducedMotion } from 'framer-motion';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import { ToastProvider } from './Toast';

const PortalShellContext = createContext({ onMenuClick: () => {} });

// Authentication / role gating is handled on the server by the (portal) and
// (admin) layouts via requireCustomer / requireAdmin in src/lib/dal.js. By the
// time this component mounts the user is guaranteed to have the right role,
// so there's no hydration flicker or client-side redirect logic here.
export function PortalShell({ navItems, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(null);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  return (
    <ToastProvider>
      <PortalShellContext.Provider value={{ onMenuClick: () => setMobileOpen(true) }}>
        <div className="flex min-h-dvh bg-offwhite">
          <PortalSidebar
            navItems={navItems}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <m.div
              key={pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex min-w-0 flex-1 flex-col"
            >
              {children}
            </m.div>
          </div>
        </div>
      </PortalShellContext.Provider>
    </ToastProvider>
  );
}

export function usePortalShell() {
  return useContext(PortalShellContext);
}

export function PortalPageHeader(props) {
  const { onMenuClick } = usePortalShell();
  return <PortalHeader {...props} onMenuClick={onMenuClick} />;
}
