'use client';

import { useCallback } from 'react';

export function Footnotes({ items }) {
  const scrollToRef = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="mt-16" aria-label="Footnotes">
      <div className="mb-4 h-px w-full bg-border" aria-hidden="true" />
      <h2 className="mb-4 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-text-muted">
        References
      </h2>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            id={`fn-${i + 1}`}
            className="flex gap-3 font-sans text-[0.8125rem] leading-[1.6] text-text-muted transition-colors duration-800"
          >
            <span className="flex-shrink-0 font-[family-name:var(--font-display)] font-semibold text-copper">
              {i + 1}.
            </span>
            <span>
              {item}{' '}
              <button
                onClick={() => scrollToRef(`fnref-${i + 1}`)}
                className="text-copper transition-colors hover:text-copper-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper"
                aria-label={`Back to reference ${i + 1}`}
              >
                &crarr;
              </button>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FootnoteRef({ id }) {
  const handleClick = () => {
    const target = document.getElementById(`fn-${id}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      target.style.backgroundColor = 'var(--color-copper-light)';
      target.style.transition = 'background-color 0.8s ease-out';
      requestAnimationFrame(() => {
        setTimeout(() => { target.style.backgroundColor = 'transparent'; }, 50);
      });
    }
  };

  return (
    <sup>
      <button
        id={`fnref-${id}`}
        onClick={handleClick}
        className="cursor-pointer font-sans text-[0.7em] font-semibold text-copper transition-colors hover:text-copper-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper"
        aria-label={`Footnote ${id}`}
      >
        {id}
      </button>
    </sup>
  );
}
