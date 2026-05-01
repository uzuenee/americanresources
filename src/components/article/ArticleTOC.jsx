'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

export function ArticleTOC({ headings, readingTime, wordCount }) {
  const [activeId, setActiveId] = useState('');
  const indicatorRef = useRef(null);
  const itemRefs = useRef({});

  // Observe heading elements for active section tracking
  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting, or the last one that scrolled past
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-120px 0px -65% 0px',
        threshold: 0,
      }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  // Move the copper indicator bar to the active item
  useEffect(() => {
    if (!activeId || !indicatorRef.current || !itemRefs.current[activeId]) return;
    const item = itemRefs.current[activeId];
    const container = indicatorRef.current.parentElement;
    if (!item || !container) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const top = itemRect.top - containerRect.top;
    const height = itemRect.height;

    indicatorRef.current.style.transform = `translateY(${top}px)`;
    indicatorRef.current.style.height = `${height}px`;
    indicatorRef.current.style.opacity = '1';
  }, [activeId]);

  if (!headings || headings.length === 0) return null;

  return (
    <nav className="relative" aria-label="Table of contents">
      <p className="mb-5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-text-muted">
        In This Article
      </p>

      <div className="relative border-l border-border">
        {/* Animated copper indicator */}
        <div
          ref={indicatorRef}
          className="absolute left-0 top-0 w-0.5 bg-copper opacity-0 transition-all duration-[400ms] ease-in-out"
          style={{ height: 0 }}
          aria-hidden="true"
        />

        <ul className="space-y-0">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                ref={(el) => {
                  itemRefs.current[h.id] = el;
                }}
                href={`#${h.id}`}
                className={cn(
                  'block w-full cursor-pointer border-l-[1px] border-transparent py-2 text-left font-sans text-sm leading-snug text-text-muted transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper',
                  h.level === 2 ? 'pl-4' : 'pl-7 text-[0.8125rem]',
                  activeId === h.id &&
                    'border-l-copper font-medium text-text-primary',
                  activeId !== h.id && 'hover:border-l-copper-dark hover:text-text-primary'
                )}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Reading time + word count */}
      {(readingTime || wordCount) && (
        <>
          <div
            className="my-5 h-px w-8 bg-border"
            aria-hidden="true"
          />
          <p className="font-sans text-[0.8125rem] text-text-muted">
            {readingTime && <>{readingTime} min</>}
            {readingTime && wordCount && (
              <span className="mx-1.5">&middot;</span>
            )}
            {wordCount && <>{wordCount.toLocaleString('en-US')} words</>}
          </p>
        </>
      )}
    </nav>
  );
}
