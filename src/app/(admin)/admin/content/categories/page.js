import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import { ContentCategories } from '@/components/portal/pages/ContentCategories';

export const metadata = { title: 'Categories & Tags' };

export default async function CategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const categoriesQuery = supabase
    .from('content_categories')
    .select('id, name, slug, color, sort_order, post_type')
    .order('sort_order');

  const [initialCategoriesRes, tagsRes] = await Promise.all([
    categoriesQuery,
    supabase.from('content_tags').select('id, name, slug').order('name'),
  ]);
  const categoriesRes =
    initialCategoriesRes.error &&
    /post_type.*(schema cache|does not exist)|(schema cache|does not exist).*post_type/i.test(initialCategoriesRes.error.message || '')
      ? await supabase
          .from('content_categories')
          .select('id, name, slug, color, sort_order')
          .order('sort_order')
      : initialCategoriesRes;

  // Get post counts per category
  const { data: catCounts } = await supabase
    .from('posts')
    .select('category_id')
    .not('category_id', 'is', null);

  const categoryPostCounts = {};
  (catCounts ?? []).forEach((row) => {
    categoryPostCounts[row.category_id] = (categoryPostCounts[row.category_id] || 0) + 1;
  });

  // Get post counts per tag
  const { data: tagCounts } = await supabase.from('post_tags').select('tag_id');
  const tagPostCounts = {};
  (tagCounts ?? []).forEach((row) => {
    tagPostCounts[row.tag_id] = (tagPostCounts[row.tag_id] || 0) + 1;
  });

  const categories = (categoriesRes.data ?? []).map((c) => ({
    ...c,
    postCount: categoryPostCounts[c.id] || 0,
  }));

  const tags = (tagsRes.data ?? []).map((t) => ({
    ...t,
    postCount: tagPostCounts[t.id] || 0,
  }));

  return <ContentCategories categories={categories} tags={tags} />;
}
