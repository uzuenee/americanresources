import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import { ContentEditor } from '@/components/portal/pages/ContentEditor';

export const metadata = { title: 'New Post' };

export default async function NewPostPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [categoriesRes, tagsRes, postsRes] = await Promise.all([
    supabase.from('content_categories').select('id, name, slug, color, post_type').order('sort_order'),
    supabase.from('content_tags').select('id, name, slug').order('name'),
    supabase.from('posts').select('id, title, type').eq('status', 'published').order('title'),
  ]);

  const safeCategoriesRes =
    categoriesRes.error &&
    /post_type.*(schema cache|does not exist)|(schema cache|does not exist).*post_type/i.test(categoriesRes.error.message || '')
      ? await supabase
          .from('content_categories')
          .select('id, name, slug, color')
          .order('sort_order')
      : categoriesRes;

  return (
    <ContentEditor
      categories={safeCategoriesRes.data ?? []}
      tags={tagsRes.data ?? []}
      allPosts={postsRes.data ?? []}
    />
  );
}
