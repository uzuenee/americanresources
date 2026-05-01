'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const ALLOWED_TYPES = ['blog', 'guide'];
const ALLOWED_STATUSES = ['draft', 'published', 'scheduled'];
const ALLOWED_SCHEMA_TYPES = ['Article', 'HowTo', 'FAQ', 'Guide'];
const ALLOWED_VISIBILITIES = ['public', 'unlisted'];

const blockSchema = z.object({
  type: z.string().min(1),
  content: z.string().optional(),
  variant: z.string().optional(),
  items: z.array(z.string()).optional(),
  ordered: z.boolean().optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  attribution: z.string().optional(),
  rows: z.array(z.array(z.string())).optional(),
}).passthrough();

const faqSchema = z.object({
  question: z.string().max(1000),
  answer: z.string().max(5000),
});

const postInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  slug: z.string().regex(/^[a-z0-9-]*$/, 'Slug must be lowercase alphanumeric with dashes').max(200).optional(),
  excerpt: z.string().max(2000).nullable().optional(),
  type: z.enum(ALLOWED_TYPES).default('blog'),
  status: z.enum(ALLOWED_STATUSES).default('draft'),
  categoryId: z.string().uuid().nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  body: z.array(blockSchema).default([]),
  keyTakeaways: z.array(z.string().max(1000)).default([]),
  faqs: z.array(faqSchema).default([]),
  footnotes: z.array(z.string().max(2000)).default([]),
  relatedPostIds: z.array(z.string().uuid()).default([]),
  heroImage: z.string().max(2000).nullable().optional(),
  heroAlt: z.string().max(500).nullable().optional(),
  heroCredit: z.string().max(500).nullable().optional(),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().url().max(2000).nullable().optional().or(z.literal('')).or(z.null()),
  ogImage: z.string().max(2000).nullable().optional(),
  schemaType: z.enum(ALLOWED_SCHEMA_TYPES).default('Article'),
  noindex: z.boolean().default(false),
  author: z.string().max(200).default('American Resources Team'),
  readTimeOverride: z.string().max(50).nullable().optional(),
  visibility: z.enum(ALLOWED_VISIBILITIES).default('public'),
  disableComments: z.boolean().default(false),
  scheduledAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
});

const idSchema = z.string().uuid('Invalid ID format');

const categoryInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().max(50).default('navy'),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  postType: z.enum(['blog', 'guide']).nullable().optional(),
});

const tagInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

function isMissingPostTypeSchemaCache(error) {
  return /post_type.*(schema cache|does not exist)|(schema cache|does not exist).*post_type/i.test(
    error?.message || ''
  );
}

function sanitizeText(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((block) => ({
    ...block,
    content: block.content ? sanitizeText(block.content) : block.content,
    items: block.items ? block.items.map(sanitizeText) : block.items,
    caption: block.caption ? sanitizeText(block.caption) : block.caption,
    attribution: block.attribution ? sanitizeText(block.attribution) : block.attribution,
  }));
}

// ---------------------------------------------------------------
// POSTS
// ---------------------------------------------------------------

export async function createPost(data) {
  await requireAdmin();

  const parsed = postInputSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const supabase = await createClient();
  const slug = d.slug || slugify(d.title);

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title: sanitizeText(d.title),
      slug,
      excerpt: d.excerpt ? sanitizeText(d.excerpt) : null,
      type: d.type,
      status: d.status,
      category_id: d.categoryId || null,
      body: sanitizeBlocks(d.body),
      key_takeaways: d.keyTakeaways.map(sanitizeText),
      faqs: d.faqs.map((f) => ({ question: sanitizeText(f.question), answer: sanitizeText(f.answer) })),
      footnotes: d.footnotes.map(sanitizeText),
      related_post_ids: d.relatedPostIds,
      hero_image: d.heroImage || null,
      hero_alt: d.heroAlt ? sanitizeText(d.heroAlt) : null,
      hero_credit: d.heroCredit ? sanitizeText(d.heroCredit) : null,
      meta_title: d.metaTitle ? sanitizeText(d.metaTitle) : null,
      meta_description: d.metaDescription ? sanitizeText(d.metaDescription) : null,
      canonical_url: d.canonicalUrl || null,
      og_image: d.ogImage || null,
      schema_type: d.schemaType,
      noindex: d.noindex,
      author: sanitizeText(d.author),
      read_time_override: d.readTimeOverride || null,
      visibility: d.visibility,
      disable_comments: d.disableComments,
      published_at: d.status === 'published' ? new Date().toISOString() : null,
      scheduled_at: d.scheduledAt || null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  if (d.tagIds?.length) {
    await supabase.from('post_tags').insert(
      d.tagIds.map((tagId) => ({ post_id: post.id, tag_id: tagId }))
    );
  }

  revalidatePath('/admin/content');
  revalidatePath('/blog');
  revalidatePath('/guides');
  return { ok: true, id: post.id };
}

export async function updatePost(id, data) {
  await requireAdmin();

  const idResult = idSchema.safeParse(id);
  if (!idResult.success) return { error: 'Invalid post ID' };

  const parsed = postInputSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const supabase = await createClient();

  const update = {};
  const fields = {
    title: 'title',
    slug: 'slug',
    excerpt: 'excerpt',
    type: 'type',
    status: 'status',
    categoryId: 'category_id',
    body: 'body',
    keyTakeaways: 'key_takeaways',
    faqs: 'faqs',
    footnotes: 'footnotes',
    relatedPostIds: 'related_post_ids',
    heroImage: 'hero_image',
    heroAlt: 'hero_alt',
    heroCredit: 'hero_credit',
    metaTitle: 'meta_title',
    metaDescription: 'meta_description',
    canonicalUrl: 'canonical_url',
    ogImage: 'og_image',
    schemaType: 'schema_type',
    noindex: 'noindex',
    author: 'author',
    readTimeOverride: 'read_time_override',
    visibility: 'visibility',
    disableComments: 'disable_comments',
    publishedAt: 'published_at',
    scheduledAt: 'scheduled_at',
  };

  for (const [jsKey, dbKey] of Object.entries(fields)) {
    if (jsKey in d) {
      let val = d[jsKey];
      if (dbKey === 'body') val = sanitizeBlocks(val);
      else if (dbKey === 'faqs' && Array.isArray(val)) val = val.map((f) => ({ question: sanitizeText(f.question), answer: sanitizeText(f.answer) }));
      else if (dbKey === 'key_takeaways' && Array.isArray(val)) val = val.map(sanitizeText);
      else if (dbKey === 'footnotes' && Array.isArray(val)) val = val.map(sanitizeText);
      else if (typeof val === 'string') val = sanitizeText(val);
      update[dbKey] = val;
    }
  }

  if (d.status === 'published' && !d.publishedAt) {
    const { data: existing } = await supabase
      .from('posts')
      .select('published_at')
      .eq('id', id)
      .single();
    if (!existing?.published_at) {
      update.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase.from('posts').update(update).eq('id', id);
  if (error) return { error: error.message };

  if ('tagIds' in d) {
    await supabase.from('post_tags').delete().eq('post_id', id);
    if (d.tagIds?.length) {
      await supabase.from('post_tags').insert(
        d.tagIds.map((tagId) => ({ post_id: id, tag_id: tagId }))
      );
    }
  }

  revalidatePath('/admin/content');
  revalidatePath(`/admin/content/${id}`);
  revalidatePath('/blog');
  revalidatePath('/guides');
  return { ok: true };
}

export async function deletePost(id) {
  await requireAdmin();
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) return { error: 'Invalid post ID' };

  const supabase = await createClient();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/content');
  revalidatePath('/blog');
  revalidatePath('/guides');
  return { ok: true };
}

export async function duplicatePost(id) {
  await requireAdmin();
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) return { error: 'Invalid post ID' };

  const supabase = await createClient();
  const { data: original, error: fetchError } = await supabase
    .from('posts')
    .select('title, slug, excerpt, type, category_id, body, key_takeaways, faqs, footnotes, related_post_ids, hero_image, hero_alt, hero_credit, meta_title, meta_description, canonical_url, og_image, schema_type, noindex, author, read_time_override, visibility, disable_comments')
    .eq('id', id)
    .single();

  if (fetchError || !original) return { error: 'Post not found.' };

  const { data: newPost, error } = await supabase
    .from('posts')
    .insert({
      ...original,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString(36)}`,
      status: 'draft',
      published_at: null,
      scheduled_at: null,
      view_count: 0,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/content');
  return { ok: true, id: newPost.id };
}

// ---------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------

export async function createCategory(data) {
  await requireAdmin();

  const parsed = categoryInputSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const supabase = await createClient();
  const slug = slugify(d.name);
  const insertPayload = {
    name: sanitizeText(d.name),
    slug,
    color: d.color,
    sort_order: d.sortOrder,
    post_type: d.postType || null,
  };
  let { data: cat, error } = await supabase
    .from('content_categories')
    .insert(insertPayload)
    .select('id, name, slug, color, sort_order, post_type')
    .single();

  if (error && isMissingPostTypeSchemaCache(error)) {
    const fallbackPayload = { ...insertPayload };
    delete fallbackPayload.post_type;
    const retry = await supabase
      .from('content_categories')
      .insert(fallbackPayload)
      .select('id, name, slug, color, sort_order')
      .single();
    cat = retry.data ? { ...retry.data, post_type: null } : retry.data;
    error = retry.error;
  }

  if (error) return { error: error.message };

  revalidatePath('/admin/content/categories');
  return { ok: true, category: cat };
}

export async function updateCategory(id, data) {
  await requireAdmin();
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) return { error: 'Invalid category ID' };

  const parsed = categoryInputSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const supabase = await createClient();
  const update = {};
  if ('name' in d) {
    update.name = sanitizeText(d.name);
    update.slug = slugify(d.name);
  }
  if ('color' in d) update.color = d.color;
  if ('sortOrder' in d) update.sort_order = d.sortOrder;
  if ('postType' in d) update.post_type = d.postType || null;

  let { error } = await supabase.from('content_categories').update(update).eq('id', id);
  if (error && isMissingPostTypeSchemaCache(error) && 'post_type' in update) {
    const fallbackUpdate = { ...update };
    delete fallbackUpdate.post_type;
    const retry = await supabase
      .from('content_categories')
      .update(fallbackUpdate)
      .eq('id', id);
    error = retry.error;
  }
  if (error) return { error: error.message };

  revalidatePath('/admin/content/categories');
  return { ok: true };
}

export async function deleteCategory(id) {
  await requireAdmin();
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) return { error: 'Invalid category ID' };

  const supabase = await createClient();

  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);

  if (count > 0) {
    return { error: `Cannot delete: ${count} post${count > 1 ? 's' : ''} still assigned to this category.` };
  }

  const { error } = await supabase.from('content_categories').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/content/categories');
  return { ok: true };
}

// ---------------------------------------------------------------
// TAGS
// ---------------------------------------------------------------

export async function createTag(data) {
  await requireAdmin();

  const parsed = tagInputSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const supabase = await createClient();
  const slug = slugify(d.name);
  const { data: tag, error } = await supabase
    .from('content_tags')
    .insert({ name: sanitizeText(d.name), slug })
    .select('id, name, slug')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/content/categories');
  return { ok: true, tag };
}

export async function deleteTag(id) {
  await requireAdmin();
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) return { error: 'Invalid tag ID' };

  const supabase = await createClient();
  const { error } = await supabase.from('content_tags').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/content/categories');
  return { ok: true };
}
