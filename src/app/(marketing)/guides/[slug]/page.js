import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { articles } from '@/data/articles';
const guides = articles.filter((a) => a.type === 'guide');
import { normalizeCmsPost } from '@/lib/article-utils';
import { GuideTemplate } from '@/components/sections/GuideTemplate';

function resolveUrl(url, siteUrl) {
  if (!url) return null;
  try {
    return new URL(url).toString();
  } catch {
    return new URL(url, siteUrl).toString();
  }
}

export async function generateStaticParams() {
  return guides
    .filter((g) => g.body)
    .map((guide) => ({ slug: guide.slug }));
}

async function getGuide(slug) {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from('posts')
    .select('*, content_categories(name)')
    .eq('slug', slug)
    .eq('type', 'guide')
    .eq('status', 'published')
    .single();

  if (row) {
    return normalizeCmsPost({ ...row, category_name: row.content_categories?.name ?? '' });
  }

  const guide = guides.find((g) => g.slug === slug);
  return guide && guide.body ? guide : null;
}

async function getRelated(guide, slug) {
  const supabase = await createClient();
  const { data: cmsRelated } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, hero_image, hero_alt, published_at, read_time_override, body, content_categories(name)')
    .eq('type', 'guide')
    .eq('status', 'published')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(6);

  const cmsNormalized = (cmsRelated ?? []).map((r) =>
    normalizeCmsPost({ ...r, category_name: r.content_categories?.name ?? '' })
  );

  const staticRelated = guides.filter((g) => g.slug !== slug && g.body);
  const all = [...cmsNormalized, ...staticRelated];

  const deduped = [];
  const seen = new Set();
  for (const g of all) {
    if (!seen.has(g.slug)) {
      seen.add(g.slug);
      deduped.push(g);
    }
    if (deduped.length >= 3) break;
  }
  return deduped;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://recyclinggroup.com';
  const imageUrl = resolveUrl(guide.ogImage || guide.image, siteUrl);
  const canonicalUrl = guide.canonicalUrl || `${siteUrl}/guides/${guide.slug}`;

  return {
    title: guide.metaTitle || guide.title,
    description: guide.metaDescription || guide.description || guide.excerpt,
    robots: guide.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url: `${siteUrl}/guides/${guide.slug}`,
      title: guide.metaTitle || guide.title,
      description: guide.metaDescription || guide.description || guide.excerpt,
      images: imageUrl ? [{ url: imageUrl }] : [],
      publishedTime: guide.isoDate || guide.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle || guide.title,
      description: guide.metaDescription || guide.description || guide.excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function GuideArticlePage({ params }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const related = await getRelated(guide, slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://recyclinggroup.com';
  const imageUrl = resolveUrl(guide.ogImage || guide.image, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.metaDescription || guide.description || guide.excerpt,
            image: imageUrl || undefined,
            datePublished: guide.isoDate || guide.date,
            author: {
              '@type': 'Organization',
              name: 'American Resources',
              url: siteUrl,
            },
            publisher: {
              '@type': 'Organization',
              name: 'American Resources',
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/American-Resources_realLogo.webp`,
              },
            },
          }).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
              { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/guides` },
              { '@type': 'ListItem', position: 3, name: guide.title },
            ],
          }).replace(/</g, '\\u003c'),
        }}
      />

      <GuideTemplate
        article={guide}
        relatedArticles={related}
      />
    </>
  );
}
