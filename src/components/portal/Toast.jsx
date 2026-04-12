'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { CheckCircleIcon, AlertCircleIcon, XIcon } from './icons';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'success', duration = 4000 }) => {
      toastId += 1;
      const id = toastId;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-6 top-6 z-[100] flex w-[min(22rem,calc(100vw-3rem))] flex-col gap-3"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <m.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.2, ease: 'easeIn' } }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pointer-events-auto flex items-start gap-3 rounded-sm border border-border/60 bg-surface p-4 shadow-[0_6px_24px_rgba(27,42,74,0.16)]"
            >
              <div className={t.variant === 'error' ? 'text-danger' : 'text-sage'}>
                {t.variant === 'error' ? (
                  <AlertCircleIcon className="h-5 w-5" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[1rem] font-semibold leading-snug text-text-primary">
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 font-sans text-[0.8125rem] text-text-muted">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="text-text-muted transition-colors hover:text-text-primary"
                aria-label="Dismiss notification"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { toast: () => {}, dismiss: () => {} };
  }
  return ctx;
}
