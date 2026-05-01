import { GuideHeader } from '@/components/article/GuideHeader';
import { GuideCTA } from '@/components/article/GuideCTA';
import { KeyTakeaways } from '@/components/article/KeyTakeaways';
import { ArticleBody } from '@/components/article/ArticleBody';
import { ArticleFAQ } from '@/components/article/ArticleFAQ';
import { ShareRail } from '@/components/article/ShareRail';
import { RelatedArticles } from '@/components/article/RelatedArticles';

/**
 * GuideTemplate — the master template for guide articles.
 * Lighter than ArticleTemplate: single column, no sidebars,
 * no progress tracking, no sticky header.
 *
 * @param {{ article: object, relatedArticles: object[] }} props
 */
export function GuideTemplate({ article, relatedArticles }) {
  const displayReadTime =
    article.readTime || `${Math.ceil((article.body || []).reduce((acc, b) => acc + ((b.content || '') + (b.items || []).join(' ')).split(/\s+/).length, 0) / 238)} min read`;

  return (
    <article className="article-page">
      {/* 1. Editorial split hero */}
      <GuideHeader
        title={article.title}
        description={article.metaDescription || article.excerpt || article.description}
        category={article.category || 'GUIDE'}
        date={article.date}
        readTime={displayReadTime}
        image={article.image}
        heroAlt={article.heroAlt}
        blurDataURL={article.blurDataURL}
      />

      {/* 2. Main content — single column */}
      <section className="bg-offwhite py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-6 md:px-8 lg:px-12">
          {/* Key takeaways */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <KeyTakeaways items={article.keyTakeaways} />
          )}

          {/* Article body */}
          <ArticleBody blocks={article.body} />

          {/* FAQ accordion */}
          {article.faqs && article.faqs.length > 0 && (
            <ArticleFAQ items={article.faqs} />
          )}

          {/* Horizontal share strip */}
          <div className="mt-12 border-t border-border pt-8">
            <div className="flex justify-center">
              <ShareRail title={article.title} horizontal />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Lightweight CTA */}
      <GuideCTA topic={article.ctaTopic} />

      {/* 4. Related articles */}
      <RelatedArticles articles={relatedArticles} basePath="/guides" />

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
