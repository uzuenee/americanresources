/**
 * SEO utilities — schema generators and meta helpers for the CMS.
 */

import { computeWordCount, computeReadingTime } from './article-utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://recyclinggroup.com';
const ORG = {
  '@type': 'Organization',
  name: 'American Resources',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/American-Resources_realLogo.webp`,
  },
};

export function generateArticleSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': post.schema_type || 'Article',
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    image: post.hero_image ? `${SITE_URL}${post.hero_image}` : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', ...ORG },
    publisher: ORG,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/${post.type}/${post.slug}`,
    },
    wordCount: computeWordCount(post.body),
    ...(post.hero_image && post.hero_alt
      ? {
          image: {
            '@type': 'ImageObject',
            url: `${SITE_URL}${post.hero_image}`,
            description: post.hero_alt,
          },
        }
      : {}),
  };
}

export function generateBreadcrumbSchema(post) {
  const typeLabel = post.type === 'guide' ? 'Guides' : 'Blog';
  const typePath = post.type === 'guide' ? '/guides' : '/blog';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: typeLabel, item: `${SITE_URL}${typePath}` },
      { '@type': 'ListItem', position: 3, name: post.title },
    ],
  };
}

export function generateFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function generateHowToSchema(post) {
  if (!post.body) return null;
  const steps = post.body
    .filter((b) => b.type === 'h2' || b.type === 'h3')
    .map((b, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: b.content,
    }));

  if (steps.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.title,
    description: post.excerpt,
    step: steps,
    totalTime: `PT${computeReadingTime(post.body)}M`,
  };
}

export function computeSEOScore(post) {
  const checks = [];

  const metaTitle = post.meta_title ?? post.metaTitle;
  const metaDesc = post.meta_description ?? post.metaDescription;
  const heroImage = post.hero_image ?? post.heroImage;
  const heroAlt = post.hero_alt ?? post.heroAlt;

  checks.push({
    label: 'Meta title set (under 60 chars)',
    status: metaTitle
      ? metaTitle.length <= 60
        ? 'pass'
        : 'warn'
      : 'fail',
  });

  checks.push({
    label: 'Meta description set (under 160 chars)',
    status: metaDesc
      ? metaDesc.length <= 160
        ? 'pass'
        : 'warn'
      : 'fail',
  });

  checks.push({
    label: 'Hero image has alt text',
    status: heroImage
      ? heroAlt
        ? 'pass'
        : 'fail'
      : 'warn',
  });

  const hasH2 = post.body?.some((b) => b.type === 'h2');
  checks.push({
    label: 'At least one H2 heading in body',
    status: hasH2 ? 'pass' : 'fail',
  });

  checks.push({
    label: 'URL slug is clean',
    status: post.slug
      ? /^[a-z0-9-]+$/.test(post.slug)
        ? 'pass'
        : 'warn'
      : 'fail',
  });

  const wordCount = computeWordCount(post.body);
  checks.push({
    label: 'At least 300 words in body',
    status: wordCount >= 300 ? 'pass' : wordCount > 0 ? 'warn' : 'fail',
  });

  return checks;
}

export function seoCompletionCount(post) {
  const checks = computeSEOScore(post);
  const passed = checks.filter((c) => c.status === 'pass').length;
  return { passed, total: checks.length };
}
