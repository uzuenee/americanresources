import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import { ContentEditor } from '@/components/portal/pages/ContentEditor';

export const metadata = { title: 'Edit Post' };

export default async function EditPostPage({ params }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const [postRes, categoriesRes, tagsRes, postsRes, postTagsRes] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).single(),
    supabase.from('content_categories').select('id, name, slug, color, post_type').order('sort_order'),
    supabase.from('content_tags').select('id, name, slug').order('name'),
    supabase.from('posts').select('id, title, type').eq('status', 'published').order('title'),
    supabase.from('post_tags').select('tag_id').eq('post_id', id),
  ]);

  const safeCategoriesRes =
    categoriesRes.error &&
    /post_type.*(schema cache|does not exist)|(schema cache|does not exist).*post_type/i.test(categoriesRes.error.message || '')
      ? await supabase
          .from('content_categories')
          .select('id, name, slug, color')
          .order('sort_order')
      : categoriesRes;

  if (!postRes.data) notFound();

  const row = postRes.data;
  const post = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    type: row.type,
    status: row.status,
    categoryId: row.category_id,
    body: row.body || [],
    keyTakeaways: row.key_takeaways || [],
    faqs: row.faqs || [],
    footnotes: row.footnotes || [],
    relatedPostIds: row.related_post_ids || [],
    heroImage: row.hero_image,
    heroAlt: row.hero_alt,
    heroCredit: row.hero_credit,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    canonicalUrl: row.canonical_url,
    ogImage: row.og_image,
    schemaType: row.schema_type,
    noindex: row.noindex,
    author: row.author,
    readTimeOverride: row.read_time_override,
    visibility: row.visibility,
    disableComments: row.disable_comments,
    publishedAt: row.published_at,
    scheduledAt: row.scheduled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    viewCount: row.view_count,
    tagIds: (postTagsRes.data ?? []).map((t) => t.tag_id),
  };

  return (
    <ContentEditor
      post={post}
      categories={safeCategoriesRes.data ?? []}
      tags={tagsRes.data ?? []}
      allPosts={(postsRes.data ?? []).filter((p) => p.id !== id)}
    />
  );
}
