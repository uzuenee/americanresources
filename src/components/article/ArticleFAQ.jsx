'use client';

import { useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

function FAQItem({ question, answer }) {
  const contentRef = useRef(null);
  const animRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const handleToggle = useCallback((e) => {
    const content = contentRef.current;
    if (!content || prefersReducedMotion) return;

    if (animRef.current) {
      animRef.current.cancel();
      animRef.current = null;
    }

    const details = e.currentTarget;
    if (details.open) {
      const height = content.scrollHeight;
      content.style.height = `${height}px`;
      content.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        const anim = content.animate(
          [{ height: `${height}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 300, easing: 'ease-out' }
        );
        animRef.current = anim;
        anim.onfinish = () => { content.style.height = ''; content.style.overflow = ''; animRef.current = null; };
      });
    } else {
      content.style.height = '0px';
      content.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        const targetHeight = content.scrollHeight;
        const anim = content.animate(
          [{ height: '0px', opacity: 0 }, { height: `${targetHeight}px`, opacity: 1 }],
          { duration: 300, easing: 'ease-out' }
        );
        animRef.current = anim;
        anim.onfinish = () => { content.style.height = ''; content.style.overflow = ''; animRef.current = null; };
      });
    }
  }, [prefersReducedMotion]);

  return (
    <details className="group border-t border-border py-6 last:border-b" onToggle={handleToggle}>
      <summary className="flex cursor-pointer items-center justify-between gap-4 font-sans text-[1rem] font-medium leading-snug text-navy [&::-webkit-details-marker]:hidden [list-style:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper">
        <span>{question}</span>
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border text-copper transition-transform duration-300 group-open:rotate-180" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </span>
      </summary>
      <div ref={contentRef}>
        <div className="max-w-[42em] pt-4 font-[family-name:var(--font-reading)] text-[1rem] leading-[1.7] text-text-primary">
          {answer}
        </div>
      </div>
    </details>
  );
}

export function ArticleFAQ({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-24">
      <h2 className="font-[family-name:var(--font-display)] text-[1.5rem] font-semibold text-text-primary">
        Frequently Asked Questions
      </h2>
      <div className="mt-6">
        {items.map((item, i) => (
          <FAQItem key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
}
