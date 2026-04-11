'use client';
import { useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useCounter } from '@/hooks/useCounter';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { cn } from '@/utils/cn';

const MECHANICAL_EASE = [0.22, 0.9, 0.36, 1];

function HeroStat({ value, suffix = '', label }) {
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const { ref, count } = useCounter(numericValue);

  return (
    <div ref={ref} role="group" aria-label={`${numericValue.toLocaleString()}${suffix} ${label}`}>
      <div className="font-sans text-2xl md:text-3xl text-white tracking-tight tabular-nums font-semibold" aria-hidden="true">
        {count.toLocaleString()}<span className="text-white/70">{suffix}</span>
      </div>
      <div className="font-sans text-xs uppercase tracking-[0.08em] text-white/70 mt-1" aria-hidden="true">
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
  blurDataURL,
  height = 'full',
  breadcrumbs,
  buttons,
  trustLine,
  stats,
  light = false,
}) {
  const scrollY = useScrollPosition();
  const prefersReducedMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);

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
            transition={{ duration: 0.5, ease: MECHANICAL_EASE }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-text-primary leading-[1.1] tracking-[-0.01em] max-w-4xl"
          >
            {title}
          </m.h1>
          {subtitle && (
            <m.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: MECHANICAL_EASE }}
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
          className="absolute inset-0 md:will-change-transform"
          style={prefersReducedMotion ? undefined : { transform: `translateY(${scrollY * 0.3}px)` }}
        >
          {blurDataURL && (
            <div
              className={cn(
                'absolute inset-0 z-[1] transition-opacity ease-out',
                imageLoaded ? 'opacity-0 duration-700' : 'opacity-100'
              )}
              style={{
                backgroundImage: `url(${blurDataURL})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
              }}
              aria-hidden="true"
            />
          )}
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover editorial-image"
            priority
            sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/60 to-navy-dark/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-16 pb-16 md:pb-24 lg:pb-32 w-full">
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 font-sans text-sm text-white/70">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">&rarr;</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-white transition-colors">{crumb.label}</Link>
                  ) : (
                    <span className="text-white/90" aria-current="page">{crumb.label}</span>
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
            transition={{ duration: 0.4, ease: MECHANICAL_EASE }}
          >
            <Eyebrow dark immediate className="mb-6">{eyebrow}</Eyebrow>
          </m.div>
        )}

        <m.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: MECHANICAL_EASE }}
          className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[6rem] font-bold uppercase text-white leading-[1.02] tracking-[-0.03em] max-w-4xl"
        >
          {title}
        </m.h1>

        {subtitle && (
          <m.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28, ease: MECHANICAL_EASE }}
            className="font-sans text-lg md:text-xl text-text-on-dark/80 leading-relaxed mt-6 max-w-[600px] font-light"
          >
            {subtitle}
          </m.p>
        )}

        {buttons && (
          <m.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.42, ease: MECHANICAL_EASE }}
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
            transition={{ duration: 0.4, delay: 0.55 }}
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
            transition={{ duration: 0.4, delay: 0.55 }}
            className="font-sans text-sm text-white/70 mt-8"
          >
            {trustLine}
          </m.p>
        ) : null}
      </div>
    </section>
  );
}
