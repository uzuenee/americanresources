'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';

/**
 * GuideHeader — editorial split hero for guide articles.
 * Two-column layout: text left, hero image right.
 * Mobile: image stacks on top, text below.
 */
export function GuideHeader({
  title,
  description,
  category,
  date,
  readTime,
  image,
  heroAlt,
  blurDataURL,
}) {
  const hasImage = Boolean(image);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: title.length > 40 ? title.slice(0, 40) + '...' : title },
  ];

  return (
    <header className="bg-offwhite">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-2 lg:gap-12 lg:px-16 lg:py-16">
        {/* Image — stacks on top for mobile */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-border bg-navy-dark lg:order-2 lg:aspect-[3/4]">
          {hasImage ? (
            <Image
              src={image}
              alt={heroAlt || title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="editorial-image object-cover"
              {...(blurDataURL ? { placeholder: 'blur', blurDataURL } : {})}
            />
          ) : (
            <div
              className="absolute inset-0 bg-[linear-gradient(145deg,rgba(13,27,42,1),rgba(27,42,74,0.92))]"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Text column */}
        <div className="flex flex-col justify-center lg:order-1">
          <AnimateOnScroll>
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 font-sans text-[0.8125rem] text-text-muted">
                {breadcrumbs.map((crumb, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <span className="text-copper/60" aria-hidden="true">
                        &rsaquo;
                      </span>
                    )}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-text-primary"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            {/* Category badge */}
            <span className="inline-block rounded-full border border-copper px-4 py-1.5 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-copper">
              {category}
            </span>

            {/* Title */}
            <h1 className="mt-4 font-serif text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.2] text-text-primary">
              {title}
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-lg font-reading text-[1.0625rem] leading-relaxed text-text-muted">
              {description}
            </p>

            {/* Read time and date */}
            <p className="mt-5 font-sans text-[0.8125rem] text-text-muted">
              {date} &middot; {readTime}
            </p>
          </AnimateOnScroll>
        </div>
      </div>
    </header>
  );
}
