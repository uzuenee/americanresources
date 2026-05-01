import { createClient } from '@/lib/supabase/server';
import { articles } from '@/data/articles';
const blogPosts = articles.filter((a) => a.type === 'blog');
import { normalizeCmsPost } from '@/lib/article-utils';
import { BlogListingClient } from './BlogListingClient';

export const metadata = {
  title: 'Blog',
  description:
    'Expert guidance on recycling, sustainability regulations, and environmental best practices for Atlanta businesses.',
  openGraph: {
    type: 'website',
    title: 'Blog — American Resources',
    description: 'Expert guidance on recycling, sustainability regulations, and environmental best practices for Atlanta businesses.',
  },
  twitter: {
    card: 'summary',
    title: 'Blog — American Resources',
    description: 'Expert guidance on recycling, sustainability regulations, and environmental best practices for Atlanta businesses.',
  },
};

export default async function BlogListingPage() {
  const supabase = await createClient();

  const { data: cmsPosts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, type, status, hero_image, hero_alt, hero_credit, published_at, read_time_override, body, key_takeaways, faqs, footnotes, meta_description, category_id, content_categories(name)')
    .eq('type', 'blog')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('published_at', { ascending: false });

  const normalizedCms = (cmsPosts ?? []).map((row) => normalizeCmsPost({
    ...row,
    category_name: row.content_categories?.name ?? '',
  }));

  // Merge: CMS posts first, then static posts (skip any with matching slugs)
  const cmsSlugSet = new Set(normalizedCms.map((p) => p.slug));
  const staticFiltered = blogPosts.filter((p) => !cmsSlugSet.has(p.slug));
  const allPosts = [...normalizedCms, ...staticFiltered];

  // Collect unique categories from both sources
  const categorySet = new Set();
  allPosts.forEach((p) => { if (p.category) categorySet.add(p.category); });
  const categories = ['All', ...Array.from(categorySet)];

  return <BlogListingClient posts={allPosts} categories={categories} />;
}
