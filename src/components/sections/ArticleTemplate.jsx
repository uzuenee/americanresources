import { extractTOC, computeWordCount, computeReadingTime } from '@/lib/article-utils';

import { ReadingProgress } from '@/components/article/ReadingProgress';
import { ArticleHero } from '@/components/article/ArticleHero';
import { ArticleStickyHeader } from '@/components/article/ArticleStickyHeader';
import { ArticleTOC } from '@/components/article/ArticleTOC';
import { KeyTakeaways } from '@/components/article/KeyTakeaways';
import { ArticleBody } from '@/components/article/ArticleBody';
import { Footnotes } from '@/components/article/Footnotes';
import { ArticleFAQ } from '@/components/article/ArticleFAQ';
import { ShareRail } from '@/components/article/ShareRail';
import { AuthorStrip } from '@/components/article/AuthorStrip';
import { ArticleCTA } from '@/components/article/ArticleCTA';
import { RelatedArticles } from '@/components/article/RelatedArticles';
import { MobileTOC } from '@/components/article/MobileTOC';

/**
 * ArticleTemplate — the master long-read page.
 * Used by both /blog/[slug] and /guides/[slug].
 *
 * @param {{ article: object, type: 'blog'|'guide', relatedArticles: object[] }} props
 */
export function ArticleTemplate({ article, type = 'blog', relatedArticles }) {
  const toc = extractTOC(article.body);
  const wordCount = computeWordCount(article.body);
  const readingTime = computeReadingTime(article.body);
  const displayReadTime = article.readTime || `${readingTime} min read`;

  return (
    <article className="article-page" style={{ '--sticky-top': 'calc(5rem + 96px)' }}>
      {/* 0. Reading progress bar */}
      <ReadingProgress />

      {/* 1. Hero */}
      <ArticleHero
        title={article.title}
        metaDescription={article.metaDescription || article.excerpt || article.description}
        category={article.category || (type === 'guide' ? 'GUIDE' : 'ARTICLE')}
        date={article.date}
        readTime={displayReadTime}
        image={article.image}
        heroAlt={article.heroAlt}
        heroCredit={article.heroCredit}
        type={type}
        blurDataURL={article.blurDataURL}
      />

      {/* 2. Sticky article header */}
      <ArticleStickyHeader title={article.title} readingTime={readingTime} />

      {/* 3. Three-column reading rig */}
      <section className="article-reading-rig bg-offwhite pt-[clamp(3rem,6vw,5rem)] pb-16">
        <div className="mx-auto grid max-w-[90rem] px-6 md:px-8 lg:px-16 xl:grid-cols-[18rem_minmax(0,1fr)_10rem] xl:gap-x-10">
          {/* Left rail — TOC (≥1280px) */}
          <aside className="hidden xl:block">
            <div
              className="sticky"
              style={{ top: 'var(--sticky-top)' }}
            >
              <ArticleTOC
                headings={toc}
                readingTime={readingTime}
                wordCount={wordCount}
              />
            </div>
          </aside>

          {/* Center column */}
          <div className="mx-auto w-full xl:mx-0 xl:pl-6 xl:pr-6">
            {/* Key takeaways */}
            <KeyTakeaways items={article.keyTakeaways} />

            {/* Article body */}
            <ArticleBody blocks={article.body} />

            {/* Footnotes */}
            <Footnotes items={article.footnotes} />

            {/* FAQ Accordion */}
            <ArticleFAQ items={article.faqs} />
          </div>

          {/* Right rail — share buttons (≥1280px) */}
          <aside className="hidden xl:block">
            <div
              className="sticky"
              style={{ top: 'var(--sticky-top)' }}
            >
              <ShareRail title={article.title} />
            </div>
          </aside>
        </div>

        {/* Mobile/tablet share strip (< 1280px) */}
        <div className="mt-12 flex justify-center xl:hidden">
          <ShareRail title={article.title} horizontal />
        </div>
      </section>

      {/* 4. Author / brand byline */}
      <AuthorStrip />

      {/* 5. End-of-article CTA */}
      <ArticleCTA />

      {/* 6. Related articles */}
      <RelatedArticles
        articles={relatedArticles}
        basePath={type === 'guide' ? '/guides' : '/blog'}
      />

      {/* Mobile TOC drawer (< 1280px) */}
      <MobileTOC headings={toc} />

      {/* JSON-LD for FAQPage (if FAQs present) */}
      {article.faqs && article.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: article.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </article>
  );
}
