'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { companyInfo } from '@/data/companyInfo';

export function MobileMenu({ isOpen, onClose, links }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };
  const closeRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the close button when menu opens
      setTimeout(() => closeRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Trap focus inside menu
  useEffect(() => {
    if (!isOpen) return;
    const menu = menuRef.current;
    if (!menu) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = menu.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          ref={menuRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-navy-dark"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex flex-col h-full px-6 py-6">
            {/* Close button */}
            <div className="flex justify-end">
              <button
                ref={closeRef}
                onClick={onClose}
                className="p-2 text-white hover:text-white/80 transition-colors"
                aria-label="Close navigation menu"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-2 mt-8" aria-label="Mobile navigation">
              {links.map((link, i) => (
                <m.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      'block font-serif text-3xl py-3 transition-colors',
                      isActive(link.href) ? 'text-copper' : 'text-white hover:text-navy-pale'
                    )}
                  >
                    {link.label}
                  </Link>
                  {link.dropdown && (
                    <div className="pl-6 flex flex-col gap-1 mt-1">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className="font-sans text-lg text-text-on-dark/70 py-2 hover:text-white transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </m.div>
              ))}
            </nav>

            {/* Bottom info */}
            <div className="mt-auto pb-8">
              <a
                href={companyInfo.phoneHref}
                className="block font-sans text-xl text-white mb-2 hover:text-navy-pale transition-colors"
              >
                {companyInfo.phone}
              </a>
              <a
                href={`mailto:${companyInfo.email}`}
                className="block font-sans text-white/60 mb-6 hover:text-white transition-colors"
              >
                {companyInfo.email}
              </a>
              <Link
                href="/contact"
                onClick={onClose}
                className="inline-block bg-accent text-white font-sans font-semibold px-8 py-3.5 rounded-lg hover:bg-accent-hover active:scale-[0.98] transition-all"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
