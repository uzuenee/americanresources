import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { articles } from '@/data/articles';
const blogPosts = articles.filter((a) => a.type === 'blog');
import { normalizeCmsPost } from '@/lib/article-utils';
import { ArticleTemplate } from '@/components/sections/ArticleTemplate';

function resolveUrl(url, siteUrl) {
  if (!url) return null;
  try {
    return new URL(url).toString();
  } catch {
    return new URL(url, siteUrl).toString();
  }
}

export async function generateStaticParams() {
  return blogPosts
    .filter((p) => p.body)
    .map((post) => ({ slug: post.slug }));
}

async function getPost(slug) {
  // Check CMS first
  const supabase = await createClient();
  const { data: row } = await supabase
    .from('posts')
    .select('*, content_categories(name)')
    .eq('slug', slug)
    .eq('type', 'blog')
    .eq('status', 'published')
    .single();

  if (row) {
    return normalizeCmsPost({ ...row, category_name: row.content_categories?.name ?? '' });
  }

  // Fall back to static data
  const post = blogPosts.find((p) => p.slug === slug);
  return post && post.body ? post : null;
}

async function getRelated(post, slug) {
  // Try CMS related posts
  const supabase = await createClient();
  const { data: cmsRelated } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, hero_image, hero_alt, published_at, read_time_override, body, content_categories(name)')
    .eq('type', 'blog')
    .eq('status', 'published')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(6);

  const cmsNormalized = (cmsRelated ?? []).map((r) =>
    normalizeCmsPost({ ...r, category_name: r.content_categories?.name ?? '' })
  );

  // Merge with static
  const staticRelated = blogPosts.filter((p) => p.slug !== slug && p.body);
  const all = [...cmsNormalized, ...staticRelated];

  // Prefer same category
  const sameCategory = all.filter((p) => p.category === post.category && p.slug !== slug);
  const others = all.filter((p) => p.category !== post.category && p.slug !== slug);
  const deduped = [];
  const seen = new Set();
  for (const p of [...sameCategory, ...others]) {
    if (!seen.has(p.slug)) {
      seen.add(p.slug);
      deduped.push(p);
    }
    if (deduped.length >= 3) break;
  }
  return deduped;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://recyclinggroup.com';
  const imageUrl = resolveUrl(post.ogImage || post.image, siteUrl);
  const canonicalUrl = post.canonicalUrl || `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    robots: post.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url: `${siteUrl}/blog/${post.slug}`,
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: imageUrl ? [{ url: imageUrl }] : [],
      publishedTime: post.isoDate || post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelated(post, slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://recyclinggroup.com';
  const imageUrl = resolveUrl(post.ogImage || post.image, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.metaDescription || post.excerpt,
            image: imageUrl || undefined,
            datePublished: post.isoDate || post.date,
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
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
              { '@type': 'ListItem', position: 3, name: post.title },
            ],
          }).replace(/</g, '\\u003c'),
        }}
      />

      <ArticleTemplate
        article={post}
        type="blog"
        relatedArticles={related}
      />
    </>
  );
}
