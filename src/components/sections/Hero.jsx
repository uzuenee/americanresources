'use client';
import { m, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useCounter } from '@/hooks/useCounter';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { cn } from '@/utils/cn';

function HeroStat({ value, suffix = '', label }) {
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const { ref, count } = useCounter(numericValue);

  return (
    <div ref={ref} role="group" aria-label={`${numericValue.toLocaleString()}${suffix} ${label}`}>
      <div className="font-mono text-2xl md:text-3xl text-white tracking-tight" aria-hidden="true">
        {count.toLocaleString()}<span className="text-white/50">{suffix}</span>
      </div>
      <div className="font-sans text-xs uppercase tracking-[0.08em] text-white/50 mt-1" aria-hidden="true">
        {label}
      </div>
    </div>
  );
}

export function Hero({
  title,
  subtitle,
  eyebrow,
  backgroundImage,
  height = 'full',
  breadcrumbs,
  buttons,
  trustLine,
  stats,
  light = false,
}) {
  const scrollY = useScrollPosition();
  const prefersReducedMotion = useReducedMotion();

  const heightClass = {
    full: 'min-h-screen',
    medium: 'min-h-[70vh]',
    short: 'min-h-[60vh]',
    shorter: 'min-h-[50vh]',
    compact: 'min-h-[40vh]',
  }[height];

  if (light) {
    return (
      <section className={cn(heightClass, 'relative flex items-end bg-offwhite pt-20')}>
        <div className="mx-auto max-w-7xl px-6 lg:px-16 pb-16 md:pb-24 w-full">
          {breadcrumbs && (
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-2 font-sans text-sm text-text-muted">
                {breadcrumbs.map((crumb, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true">&rarr;</span>}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-navy transition-colors">{crumb.label}</Link>
                    ) : (
                      <span className="text-text-primary" aria-current="page">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <m.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-text-primary leading-[1.1] tracking-[-0.01em] max-w-4xl"
          >
            {title}
          </m.h1>
          {subtitle && (
            <m.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="font-sans text-lg md:text-xl text-text-muted leading-relaxed mt-6 max-w-2xl"
            >
              {subtitle}
            </m.p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={cn(heightClass, 'relative flex items-end overflow-hidden')}>
      {/* Background image with parallax */}
      {backgroundImage && (
        <div
          className="absolute inset-0 will-change-transform"
          style={prefersReducedMotion ? undefined : { transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover editorial-image"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/60 to-navy-dark/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-16 pb-16 md:pb-24 lg:pb-32 w-full">
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 font-sans text-sm text-white/60">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">&rarr;</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-white/80 transition-colors">{crumb.label}</Link>
                  ) : (
                    <span className="text-white/70" aria-current="page">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <m.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="block w-10 h-0.5 bg-navy-light" aria-hidden="true" />
            <span className="font-sans text-sm font-medium uppercase tracking-[0.15em] text-navy-pale">
              {eyebrow}
            </span>
          </m.div>
        )}

        <m.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[6rem] text-white leading-[1.02] tracking-[-0.03em] max-w-4xl"
        >
          {title}
        </m.h1>

        {subtitle && (
          <m.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
            className="font-sans text-lg md:text-xl text-text-on-dark/80 leading-relaxed mt-6 max-w-[600px] font-light"
          >
            {subtitle}
          </m.p>
        )}

        {buttons && (
          <m.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7, ease: 'easeOut' }}
            className="flex flex-wrap gap-4 mt-10"
          >
            {buttons.map((btn, i) => (
              <Button
                key={i}
                variant={btn.variant || 'primary'}
                href={btn.href}
                arrow={btn.arrow}
              >
                {btn.label}
              </Button>
            ))}
          </m.div>
        )}

        {stats ? (
          <m.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1 }}
            className="flex flex-wrap gap-x-10 gap-y-4 md:gap-x-14 mt-10 pt-8 border-t border-white/10"
          >
            {stats.map((stat, i) => (
              <HeroStat key={i} {...stat} />
            ))}
          </m.div>
        ) : trustLine ? (
          <m.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1 }}
            className="font-sans text-sm text-white/60 mt-8"
          >
            {trustLine}
          </m.p>
        ) : null}
      </div>
    </section>
  );
}
