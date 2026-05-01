'use client';

import { useState } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

export function MobileTOC({ headings }) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  if (!headings || headings.length === 0) return null;

  return (
    <>
      {/* Floating button — bottom-right */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-navy shadow-lg text-text-on-dark transition-transform hover:scale-105 active:scale-95 xl:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        aria-label="Open table of contents"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="11" y2="18" />
        </svg>
      </button>

      {/* Drawer overlay + panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <m.div
              role="button"
              aria-label="Close table of contents"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-50 bg-navy-dark/40 backdrop-blur-sm xl:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <m.div
              role="dialog"
              aria-modal="true"
              initial={prefersReducedMotion ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[85vw] max-w-[340px] overflow-y-auto bg-offwhite p-8 shadow-2xl xl:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="mb-6 flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-copper hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
                aria-label="Close table of contents"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <p className="mb-5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-text-muted">
                In This Article
              </p>

              <ul className="space-y-1 border-l border-border">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'block w-full cursor-pointer border-l border-transparent py-2.5 text-left font-sans text-[0.9375rem] leading-snug text-text-muted transition-colors hover:text-text-primary hover:border-l-copper focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper',
                        h.level === 2 ? 'pl-4' : 'pl-7 text-[0.875rem]'
                      )}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
