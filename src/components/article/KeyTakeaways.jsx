'use client';

import { m, useReducedMotion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';

export function KeyTakeaways({ items }) {
  const [ref, isInView] = useInView({ threshold: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  if (!items || items.length === 0) return null;

  return (
    <m.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-14 rounded-sm border-l-[3px] border-copper bg-surface px-[clamp(1.75rem,3vw,2.5rem)] py-[clamp(1.75rem,3vw,2.5rem)] shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
    >
      <h2 className="mb-4 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-copper">
        Key Takeaways
      </h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <m.li
            key={i}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : 0.06 * i, ease: 'easeOut' }}
            className="flex items-start gap-3.5 font-[family-name:var(--font-reading)] text-[1rem] leading-[1.7] text-text-primary"
          >
            <svg className="mt-[0.4em] h-4 w-4 flex-shrink-0 text-copper" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{item}</span>
          </m.li>
        ))}
      </ul>
    </m.div>
  );
}
