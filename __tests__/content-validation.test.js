import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(1000).optional().default(''),
  type: z.enum(['blog', 'guide']),
  status: z.enum(['draft', 'published', 'scheduled']).optional().default('draft'),
  schema_type: z.enum(['Article', 'HowTo', 'FAQ', 'Guide']).optional().default('Article'),
  visibility: z.enum(['public', 'unlisted']).optional().default('public'),
  category_id: z.string().optional().nullable(),
  body: z.array(z.any()).optional().default([]),
  key_takeaways: z.array(z.string()).optional().default([]),
  faqs: z.array(z.any()).optional().default([]),
  footnotes: z.array(z.string()).optional().default([]),
  hero_image: z.string().optional().default(''),
  hero_alt: z.string().optional().default(''),
  hero_credit: z.string().optional().default(''),
  meta_title: z.string().max(200).optional().default(''),
  meta_description: z.string().max(500).optional().default(''),
  og_image: z.string().optional().default(''),
  canonical_url: z.string().optional().default(''),
  noindex: z.boolean().optional().default(false),
  scheduled_at: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.enum(['navy', 'copper', 'sage', 'muted', 'accent']).optional().default('navy'),
  sortOrder: z.number().optional(),
  postType: z.string().optional(),
});

const tagSchema = z.object({
  name: z.string().min(1).max(100),
});

// ---------------------------------------------------------------------------
// Post schema
// ---------------------------------------------------------------------------
describe('post schema validation', () => {
  const validPost = {
    title: 'Test Blog Post',
    type: 'blog',
  };

  it('accepts minimal valid post', () => {
    expect(postSchema.safeParse(validPost).success).toBe(true);
  });

  it('accepts fully populated post', () => {
    const full = {
      ...validPost,
      slug: 'test-blog-post',
      excerpt: 'A test excerpt',
      status: 'published',
      schema_type: 'Article',
      visibility: 'public',
      category_id: 'cat-123',
      body: [{ type: 'p', content: 'Hello' }],
      key_takeaways: ['Point 1', 'Point 2'],
      faqs: [{ question: 'Q?', answer: 'A.' }],
      footnotes: ['Ref 1'],
      hero_image: '/images/hero.jpg',
      hero_alt: 'Alt text',
      hero_credit: 'Photographer',
      meta_title: 'SEO Title',
      meta_description: 'SEO desc',
      og_image: '/images/og.jpg',
      noindex: false,
      tags: ['tag-1', 'tag-2'],
    };
    expect(postSchema.safeParse(full).success).toBe(true);
  });

  it('rejects missing title', () => {
    const result = postSchema.safeParse({ type: 'blog' });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = postSchema.safeParse({ title: '', type: 'blog' });
    expect(result.success).toBe(false);
  });

  it('rejects title over 500 chars', () => {
    const result = postSchema.safeParse({ title: 'A'.repeat(501), type: 'blog' });
    expect(result.success).toBe(false);
  });

  it('rejects missing type', () => {
    const result = postSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = postSchema.safeParse({ title: 'Test', type: 'article' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = postSchema.safeParse({ ...validPost, status: 'archived' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid schema_type', () => {
    const result = postSchema.safeParse({ ...validPost, schema_type: 'BlogPost' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid visibility', () => {
    const result = postSchema.safeParse({ ...validPost, visibility: 'private' });
    expect(result.success).toBe(false);
  });

  it('defaults status to draft', () => {
    const result = postSchema.safeParse(validPost);
    expect(result.data.status).toBe('draft');
  });

  it('defaults visibility to public', () => {
    const result = postSchema.safeParse(validPost);
    expect(result.data.visibility).toBe('public');
  });

  it('defaults schema_type to Article', () => {
    const result = postSchema.safeParse(validPost);
    expect(result.data.schema_type).toBe('Article');
  });

  it('defaults arrays to empty', () => {
    const result = postSchema.safeParse(validPost);
    expect(result.data.body).toEqual([]);
    expect(result.data.key_takeaways).toEqual([]);
    expect(result.data.faqs).toEqual([]);
    expect(result.data.footnotes).toEqual([]);
    expect(result.data.tags).toEqual([]);
  });

  it('accepts both blog and guide types', () => {
    expect(postSchema.safeParse({ title: 'T', type: 'blog' }).success).toBe(true);
    expect(postSchema.safeParse({ title: 'T', type: 'guide' }).success).toBe(true);
  });

  it('accepts all valid status values', () => {
    ['draft', 'published', 'scheduled'].forEach((status) => {
      expect(postSchema.safeParse({ ...validPost, status }).success).toBe(true);
    });
  });

  it('accepts all valid schema_type values', () => {
    ['Article', 'HowTo', 'FAQ', 'Guide'].forEach((schema_type) => {
      expect(postSchema.safeParse({ ...validPost, schema_type }).success).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Category schema
// ---------------------------------------------------------------------------
describe('category schema validation', () => {
  it('accepts valid category', () => {
    expect(categorySchema.safeParse({ name: 'Recycling' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(categorySchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects name over 100 chars', () => {
    expect(categorySchema.safeParse({ name: 'A'.repeat(101) }).success).toBe(false);
  });

  it('accepts all valid colors', () => {
    ['navy', 'copper', 'sage', 'muted', 'accent'].forEach((color) => {
      expect(categorySchema.safeParse({ name: 'Test', color }).success).toBe(true);
    });
  });

  it('rejects invalid color', () => {
    expect(categorySchema.safeParse({ name: 'Test', color: 'red' }).success).toBe(false);
  });

  it('defaults color to navy', () => {
    const result = categorySchema.safeParse({ name: 'Test' });
    expect(result.data.color).toBe('navy');
  });
});

// ---------------------------------------------------------------------------
// Tag schema
// ---------------------------------------------------------------------------
describe('tag schema validation', () => {
  it('accepts valid tag', () => {
    expect(tagSchema.safeParse({ name: 'sustainability' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(tagSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects name over 100 chars', () => {
    expect(tagSchema.safeParse({ name: 'A'.repeat(101) }).success).toBe(false);
  });
});
