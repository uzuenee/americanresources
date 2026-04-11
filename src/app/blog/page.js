'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Hero } from '@/components/sections/Hero';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { blogPosts } from '@/data/blogPosts';
import { cn } from '@/utils/cn';

const categoryStyles = {
  GUIDE: 'bg-navy-pale text-navy-light',
  'INDUSTRY NEWS': 'bg-accent-light text-accent',
  ATLANTA: 'bg-sage-light text-sage',
};

const categories = ['All', 'GUIDE', 'INDUSTRY NEWS', 'ATLANTA'];

function BlogCard({ post, index }) {
  return (
    <AnimateOnScroll delay={index * 0.08}>
      <article>
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-5">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover editorial-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <span className={cn(
          'inline-block font-sans text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3',
          categoryStyles[post.category] || 'bg-navy-pale text-navy-light'
        )}>
          {post.category}
        </span>
        <h3 className="font-serif text-xl md:text-[22px] text-text-primary leading-tight line-clamp-2">
          {post.title}
        </h3>
        <p className="font-sans text-[15px] text-text-muted leading-relaxed mt-2 line-clamp-2">
          {post.excerpt}
        </p>
        <p className="font-sans text-[13px] text-text-muted mt-3">
          {post.date} &middot; {post.readTime}
        </p>
      </article>
    </AnimateOnScroll>
  );
}

export default function BlogListingPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All'
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <>
      <Hero
        height="compact"
        light
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog' },
        ]}
        title="Insights & Resources"
        subtitle="Expert guidance on recycling, sustainability regulations, and environmental best practices for Atlanta businesses."
      />

      {/* Filter bar */}
      <section className="bg-offwhite pb-4">
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
                      .toLowerCase()
                      .split(' ')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Article grid */}
      <section className="bg-offwhite pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filtered.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} />
            ))}
          </div>
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
