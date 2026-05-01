import Image from 'next/image';
import Link from 'next/link';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';

const categoryStyles = {
  'HOW-TO': 'bg-navy-pale/60 text-navy',
  'INDUSTRY NEWS': 'bg-copper-light/40 text-copper-dark',
  ATLANTA: 'bg-sage-light text-sage',
};

function RelatedCard({ article, index, basePath }) {
  return (
    <AnimateOnScroll delay={index * 0.1}>
      <article>
        <Link href={`${basePath}/${article.slug}`} className="group block">
          <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-sm">
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="editorial-image object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            {article.category && (
              <span className={`absolute left-3 top-3 rounded-full px-3 py-1 font-sans text-[0.6875rem] font-semibold uppercase tracking-wider ${categoryStyles[article.category] || 'bg-offwhite-alt/90 text-text-muted'}`}>
                {article.category}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-[1.125rem] font-semibold leading-tight text-text-primary transition-colors group-hover:text-copper">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 font-sans text-[0.875rem] leading-relaxed text-text-muted">
            {article.excerpt || article.description}
          </p>
          <p className="mt-2 font-sans text-[0.8125rem] text-text-muted">
            {article.date && <>{article.date} &middot; </>}
            {article.readTime}
          </p>
        </Link>
      </article>
    </AnimateOnScroll>
  );
}

export function RelatedArticles({ articles, basePath = '/blog' }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="bg-offwhite-alt py-16">
      <div className="mx-auto max-w-[1200px] px-8">
        <h2 className="mb-10 text-center font-[family-name:var(--font-display)] text-[1.75rem] font-semibold text-text-primary">
          Continue Reading
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((article, i) => (
            <RelatedCard key={article.slug} article={article} index={i} basePath={basePath} />
          ))}
        </div>
      </div>
    </section>
  );
}
