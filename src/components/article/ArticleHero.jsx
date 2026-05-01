'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

export function ArticleHero({
  title,
  metaDescription,
  category,
  date,
  readTime,
  image,
  heroAlt,
  heroCredit,
  type = 'blog',
  blurDataURL,
}) {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef(null);
  const parallaxRef = useRef(null);
  const isWideRef = useRef(false);
  const [heroHeight, setHeroHeight] = useState(0);

  useEffect(() => {
    if (heroRef.current) setHeroHeight(heroRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--article-hero-height', `${heroHeight}px`);
  }, [heroHeight]);

  // Debounced resize listener
  useEffect(() => {
    let timeout;
    isWideRef.current = window.innerWidth >= 768;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        isWideRef.current = window.innerWidth >= 768;
      }, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timeout);
    };
  }, []);

  // Parallax via direct DOM manipulation to avoid re-renders
  useEffect(() => {
    if (prefersReducedMotion) return;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (parallaxRef.current && isWideRef.current) {
          const y = window.scrollY * -0.45;
          parallaxRef.current.style.transform = `translateY(${y}px)`;
        } else if (parallaxRef.current) {
          parallaxRef.current.style.transform = '';
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [prefersReducedMotion]);

  const words = title.split(' ');
  const hasImage = Boolean(image);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: type === 'blog' ? 'Blog' : 'Guides', href: type === 'blog' ? '/blog' : '/guides' },
    { label: title.length > 40 ? title.slice(0, 40) + '...' : title },
  ];

  return (
    <header
      ref={heroRef}
      className="article-hero relative w-full overflow-hidden"
      style={{ height: 'clamp(280px, 55vh, 560px)', minHeight: '280px' }}
    >
      {hasImage ? (
        <div ref={parallaxRef} className="absolute inset-0">
          <m.div
            className="h-full w-full"
            initial={prefersReducedMotion ? false : { scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: 'easeOut' }}
          >
            <Image
              src={image}
              alt={heroAlt || title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ filter: 'saturate(0.88) brightness(0.95) contrast(1.05)' }}
              {...(blurDataURL ? { placeholder: 'blur', blurDataURL } : {})}
            />
          </m.div>
        </div>
      ) : (
        <div
          ref={parallaxRef}
          className="absolute inset-0 bg-navy-dark"
          aria-hidden="true"
        />
      )}

      {/* Warm color grade overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(196,149,106,0.10) 0%, transparent 60%)' }}
        aria-hidden="true"
      />

      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
        aria-hidden="true"
      />

      {/* Navy gradient from bottom — stronger for readability */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: hasImage
            ? 'linear-gradient(to top, rgba(13,27,42,0.85) 0%, rgba(13,27,42,0.4) 40%, transparent 70%)'
            : 'linear-gradient(to top, rgba(13,27,42,0.98) 0%, rgba(13,27,42,0.88) 55%, rgba(13,27,42,0.76) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Copper hairline at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-copper" aria-hidden="true" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-[1200px] px-6 pb-8 md:px-8">
          {/* Breadcrumbs */}
          <m.nav
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            aria-label="Breadcrumb"
            className="mb-5"
          >
            <ol className="flex flex-wrap items-center gap-1.5 font-sans text-[0.8125rem] text-white/70" style={{ textShadow: '0 1px 3px rgba(13,27,42,0.5)' }}>
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-copper/60" aria-hidden="true">&rsaquo;</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-white">{crumb.label}</Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </m.nav>

          {/* Category badge */}
          <m.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className={cn(
              'inline-block rounded-full px-4 py-1.5 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.15em] backdrop-blur-sm',
              type === 'guide'
                ? 'bg-copper/90 text-white'
                : 'bg-white/15 text-white'
            )}>
              {category}
            </span>
          </m.div>

          {/* Title — Playfair Display */}
          <h1
            className="mt-4 max-w-[48rem] font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,3.75rem)] font-bold leading-[1.15] text-white"
            style={{ textShadow: '0 2px 8px rgba(13,27,42,0.4)' }}
          >
            {words.map((word, i) => (
              <span key={i}>
                <m.span
                  className="inline-block"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {word}
                </m.span>
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>

          {/* Meta line */}
          <m.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="mt-5 font-sans text-[0.9rem] text-white/70"
          >
            {date} &middot; {readTime}
          </m.p>
        </div>
      </div>
    </header>
  );
}
