import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import { ContentDashboard } from '@/components/portal/pages/ContentDashboard';

export const metadata = { title: 'Content' };

export default async function ContentPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [postsRes, categoriesRes] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, slug, excerpt, type, status, category_id, content_categories(name, color), hero_image, hero_alt, meta_title, meta_description, published_at, scheduled_at, created_at, view_count, body')
      .order('created_at', { ascending: false }),
    supabase
      .from('content_categories')
      .select('id, name, slug, color')
      .order('sort_order'),
  ]);

  const posts = (postsRes.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    type: row.type,
    status: row.status,
    categoryId: row.category_id,
    categoryName: row.content_categories?.name ?? null,
    categoryColor: row.content_categories?.color ?? null,
    heroImage: row.hero_image,
    heroAlt: row.hero_alt,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    publishedAt: row.published_at,
    scheduledAt: row.scheduled_at,
    createdAt: row.created_at,
    viewCount: row.view_count,
    hasBody: Array.isArray(row.body) && row.body.length > 0,
  }));

  const categories = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    color: c.color,
  }));

  return <ContentDashboard posts={posts} categories={categories} />;
}
