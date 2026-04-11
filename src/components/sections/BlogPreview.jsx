'use client';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '@/data/blogPosts';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { cn } from '@/utils/cn';

const categoryStyles = {
  GUIDE: 'bg-navy-pale text-navy-light',
  'INDUSTRY NEWS': 'bg-accent-light text-accent',
  ATLANTA: 'bg-sage-light text-sage',
};

function BlogCard({ post, featured = false }) {
  return (
    <article className="h-full">
      <div
        className={cn(
          'relative overflow-hidden mb-5',
          featured ? 'aspect-[16/9] rounded-2xl' : 'aspect-[16/10] rounded-xl'
        )}
      >
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover editorial-image"
          sizes={featured ? '(max-width: 1024px) 100vw, 60vw' : '(max-width: 768px) 100vw, 33vw'}
        />
      </div>
      <span
        className={cn(
          'inline-block font-sans text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3',
          categoryStyles[post.category] || 'bg-navy-pale text-navy-light'
        )}
      >
        {post.category}
      </span>
      <h3
        className={cn(
          'font-serif text-text-primary leading-tight line-clamp-2',
          featured ? 'text-2xl md:text-3xl' : 'text-xl md:text-[1.375rem]'
        )}
      >
        {post.title}
      </h3>
      <p
        className={cn(
          'font-sans text-text-muted leading-relaxed mt-2 line-clamp-2',
          featured ? 'text-base md:text-lg' : 'text-[0.9375rem]'
        )}
      >
        {post.excerpt}
      </p>
      <p className="font-sans text-[0.8125rem] text-text-muted mt-3">
        {post.date} &middot; {post.readTime}
      </p>
    </article>
  );
}

export function BlogPreview({ count = 3 }) {
  const previewPosts = blogPosts.slice(0, count);
  const [featured, ...rest] = previewPosts;

  return (
    <section className="bg-surface py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 lg:mb-16">
          <AnimateOnScroll>
            <div className="w-12 h-1 bg-copper mb-6" aria-hidden="true" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-text-primary leading-[1.1]">
              Insights for Sustainable Business
            </h2>
          </AnimateOnScroll>
          <Link
            href="/blog"
            className="font-sans text-base text-accent hover:text-accent-hover hover:underline mt-4 md:mt-0 flex-shrink-0 group"
          >
            View All Articles{' '}
            <span
              className="inline-block transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </Link>
        </div>

        {/* Asymmetric layout: featured large left, two smaller stacked right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-7">
            <AnimateOnScroll>
              <BlogCard post={featured} featured />
            </AnimateOnScroll>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-8 lg:gap-10">
            {rest.map((post, i) => (
              <AnimateOnScroll key={post.slug} delay={0.1 + i * 0.1}>
                <BlogCard post={post} />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
