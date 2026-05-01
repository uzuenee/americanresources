'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Hero } from '@/components/sections/Hero';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { cn } from '@/utils/cn';

const categoryStyles = {
  'HOW-TO': 'bg-navy-pale text-navy-light',
  'How-To': 'bg-navy-pale text-navy-light',
  'INDUSTRY NEWS': 'bg-accent-light text-accent',
  'Industry News': 'bg-accent-light text-accent',
  ATLANTA: 'bg-sage-light text-sage',
  Atlanta: 'bg-sage-light text-sage',
};

function FeaturedPost({ post }) {
  return (
    <AnimateOnScroll>
      <article>
        <Link href={`/blog/${post.slug}`} className="group block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.heroAlt || post.title}
                  fill
                  className="object-cover editorial-image transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
            </div>
            <div className="flex flex-col justify-center">
              {post.category && (
                <span
                  className={cn(
                    'inline-block self-start font-sans text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4',
                    categoryStyles[post.category] || 'bg-navy-pale text-navy-light'
                  )}
                >
                  {post.category}
                </span>
              )}
              <h2 className="font-serif text-2xl md:text-[1.75rem] text-text-primary leading-tight group-hover:text-navy-light transition-colors duration-200">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="font-sans text-base text-text-muted leading-relaxed mt-3 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <p className="font-sans text-[0.8125rem] text-text-muted mt-4">
                {post.date}
                {post.readTime && <> &middot; {post.readTime}</>}
              </p>
            </div>
          </div>
        </Link>
      </article>
    </AnimateOnScroll>
  );
}

function BlogCard({ post, index }) {
  return (
    <AnimateOnScroll delay={index * 0.08}>
      <article>
        <Link href={`/blog/${post.slug}`} className="group block">
          <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-5">
            {post.image && (
              <Image
                src={post.image}
                alt={post.heroAlt || post.title}
                fill
                className="object-cover editorial-image transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
            {post.category && (
              <span
                className={cn(
                  'absolute bottom-3 left-3 font-sans text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full',
                  categoryStyles[post.category] || 'bg-navy-pale text-navy-light'
                )}
              >
                {post.category}
              </span>
            )}
          </div>
          <h3 className="font-serif text-xl md:text-[1.375rem] text-text-primary leading-tight line-clamp-2 group-hover:text-navy-light transition-colors duration-200">
            {post.title}
          </h3>
          <p className="font-sans text-[0.9375rem] text-text-muted leading-relaxed mt-2 line-clamp-2">
            {post.excerpt}
          </p>
          <p className="font-sans text-[0.8125rem] text-text-muted mt-3">
            {post.readTime || ''}
          </p>
        </Link>
      </article>
    </AnimateOnScroll>
  );
}

export function BlogListingClient({ posts, categories }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All'
      ? posts
      : posts.filter(
          (p) =>
            p.category === activeCategory ||
            p.category?.toUpperCase() === activeCategory.toUpperCase()
        );

  const featuredPost = filtered.length > 0 ? filtered[0] : null;
  const remainingPosts = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <>
      <Hero
        height="compact"
        light
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog' },
        ]}
        title="Insights & Blog"
        subtitle="Expert guidance on recycling, sustainability regulations, and environmental best practices for Atlanta businesses."
      />

      {/* Featured post */}
      {featuredPost && (
        <section className="bg-offwhite pb-8 md:pb-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-16">
            <FeaturedPost post={featuredPost} />
          </div>
        </section>
      )}

      {/* Category filter pills */}
      {categories.length > 2 && (
        <section className="bg-offwhite pb-6">
          <div className="mx-auto max-w-7xl px-6 lg:px-16">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'font-sans text-sm font-medium px-5 py-2 rounded-full transition-all duration-200 cursor-pointer',
                    activeCategory === cat
                      ? 'bg-navy text-white'
                      : 'bg-transparent border border-border text-text-muted hover:border-navy/30 hover:text-text-primary'
                  )}
                >
                  {cat === 'All'
                    ? 'All'
                    : cat
                        .split(/[\s-]+/)
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ')}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Remaining posts grid */}
      <section className="bg-offwhite pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          {remainingPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {remainingPosts.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <p className="font-sans text-text-muted text-center py-16">
              No articles in this category yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
