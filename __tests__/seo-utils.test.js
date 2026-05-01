import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://test.com');

const {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
  computeSEOScore,
  seoCompletionCount,
} = await import('@/lib/seo-utils');

const makePost = (overrides = {}) => ({
  title: 'Test Article',
  slug: 'test-article',
  excerpt: 'A test article excerpt.',
  type: 'blog',
  meta_title: 'Test Meta Title',
  meta_description: 'A meta description.',
  hero_image: '/images/hero.jpg',
  hero_alt: 'Hero image alt',
  published_at: '2025-03-15T10:00:00Z',
  updated_at: '2025-03-16T10:00:00Z',
  schema_type: 'Article',
  body: [
    { type: 'h2', content: 'First Heading' },
    { type: 'p', content: Array(100).fill('word').join(' ') },
    { type: 'h3', content: 'Sub Heading' },
    { type: 'p', content: Array(250).fill('word').join(' ') },
  ],
  ...overrides,
});

// ---------------------------------------------------------------------------
// generateArticleSchema
// ---------------------------------------------------------------------------
describe('generateArticleSchema', () => {
  it('generates valid Article schema', () => {
    const schema = generateArticleSchema(makePost());
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe('Test Meta Title');
    expect(schema.description).toBe('A meta description.');
    expect(schema.datePublished).toBe('2025-03-15T10:00:00Z');
    expect(schema.dateModified).toBe('2025-03-16T10:00:00Z');
  });

  it('falls back to title when meta_title is missing', () => {
    const schema = generateArticleSchema(makePost({ meta_title: null }));
    expect(schema.headline).toBe('Test Article');
  });

  it('uses schema_type from post', () => {
    const schema = generateArticleSchema(makePost({ schema_type: 'HowTo' }));
    expect(schema['@type']).toBe('HowTo');
  });

  it('sets mainEntityOfPage with correct URL', () => {
    const schema = generateArticleSchema(makePost());
    expect(schema.mainEntityOfPage['@id']).toBe('https://test.com/blog/test-article');
  });

  it('computes wordCount from body', () => {
    const schema = generateArticleSchema(makePost());
    expect(schema.wordCount).toBeGreaterThan(0);
  });

  it('includes publisher organization', () => {
    const schema = generateArticleSchema(makePost());
    expect(schema.publisher.name).toBe('American Resources');
  });
});

// ---------------------------------------------------------------------------
// generateBreadcrumbSchema
// ---------------------------------------------------------------------------
describe('generateBreadcrumbSchema', () => {
  it('generates BreadcrumbList for blog posts', () => {
    const schema = generateBreadcrumbSchema(makePost());
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].name).toBe('Home');
    expect(schema.itemListElement[1].name).toBe('Blog');
    expect(schema.itemListElement[2].name).toBe('Test Article');
  });

  it('generates BreadcrumbList for guide posts', () => {
    const schema = generateBreadcrumbSchema(makePost({ type: 'guide' }));
    expect(schema.itemListElement[1].name).toBe('Guides');
    expect(schema.itemListElement[1].item).toBe('https://test.com/guides');
  });

  it('uses correct position numbering', () => {
    const schema = generateBreadcrumbSchema(makePost());
    schema.itemListElement.forEach((item, i) => {
      expect(item.position).toBe(i + 1);
    });
  });
});

// ---------------------------------------------------------------------------
// generateFAQSchema
// ---------------------------------------------------------------------------
describe('generateFAQSchema', () => {
  it('generates FAQPage schema from FAQ array', () => {
    const faqs = [
      { question: 'What is this?', answer: 'A test.' },
      { question: 'How does it work?', answer: 'Magically.' },
    ];
    const schema = generateFAQSchema(faqs);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0]['@type']).toBe('Question');
    expect(schema.mainEntity[0].name).toBe('What is this?');
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('A test.');
  });

  it('returns null for empty FAQ array', () => {
    expect(generateFAQSchema([])).toBeNull();
  });

  it('returns null for null/undefined FAQs', () => {
    expect(generateFAQSchema(null)).toBeNull();
    expect(generateFAQSchema(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// generateHowToSchema
// ---------------------------------------------------------------------------
describe('generateHowToSchema', () => {
  it('generates HowTo schema from h2/h3 headings', () => {
    const schema = generateHowToSchema(makePost());
    expect(schema['@type']).toBe('HowTo');
    expect(schema.name).toBe('Test Article');
    expect(schema.step).toHaveLength(2);
    expect(schema.step[0].name).toBe('First Heading');
    expect(schema.step[0].position).toBe(1);
    expect(schema.step[1].name).toBe('Sub Heading');
  });

  it('includes totalTime in ISO 8601 duration format', () => {
    const schema = generateHowToSchema(makePost());
    expect(schema.totalTime).toMatch(/^PT\d+M$/);
  });

  it('returns null if body has no headings', () => {
    const post = makePost({ body: [{ type: 'p', content: 'just text' }] });
    expect(generateHowToSchema(post)).toBeNull();
  });

  it('returns null if body is null', () => {
    expect(generateHowToSchema(makePost({ body: null }))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// computeSEOScore
// ---------------------------------------------------------------------------
describe('computeSEOScore', () => {
  it('returns 6 checks', () => {
    const checks = computeSEOScore(makePost());
    expect(checks).toHaveLength(6);
  });

  it('passes all checks for a well-formed post', () => {
    const checks = computeSEOScore(makePost());
    const statuses = checks.map((c) => c.status);
    expect(statuses).toEqual(['pass', 'pass', 'pass', 'pass', 'pass', 'pass']);
  });

  it('fails meta title check when missing', () => {
    const checks = computeSEOScore(makePost({ meta_title: null, metaTitle: null }));
    expect(checks[0].status).toBe('fail');
  });

  it('warns when meta title exceeds 60 chars', () => {
    const longTitle = 'A'.repeat(61);
    const checks = computeSEOScore(makePost({ meta_title: longTitle }));
    expect(checks[0].status).toBe('warn');
  });

  it('fails meta description when missing', () => {
    const checks = computeSEOScore(makePost({ meta_description: null, metaDescription: null }));
    expect(checks[1].status).toBe('fail');
  });

  it('warns when meta description exceeds 160 chars', () => {
    const longDesc = 'A'.repeat(161);
    const checks = computeSEOScore(makePost({ meta_description: longDesc }));
    expect(checks[1].status).toBe('warn');
  });

  it('fails hero alt check when image exists but no alt', () => {
    const checks = computeSEOScore(makePost({ hero_alt: null, heroAlt: null }));
    expect(checks[2].status).toBe('fail');
  });

  it('warns hero image check when no image at all', () => {
    const checks = computeSEOScore(makePost({ hero_image: null, heroImage: null, hero_alt: null, heroAlt: null }));
    expect(checks[2].status).toBe('warn');
  });

  it('fails H2 check when body has no h2', () => {
    const checks = computeSEOScore(makePost({ body: [{ type: 'p', content: 'text' }] }));
    expect(checks[3].status).toBe('fail');
  });

  it('fails slug check when slug is empty', () => {
    const checks = computeSEOScore(makePost({ slug: '' }));
    expect(checks[4].status).toBe('fail');
  });

  it('warns slug check when slug has uppercase or special chars', () => {
    const checks = computeSEOScore(makePost({ slug: 'Has_Uppercase' }));
    expect(checks[4].status).toBe('warn');
  });

  it('warns word count when body is short (< 300 words but > 0)', () => {
    const checks = computeSEOScore(makePost({
      body: [{ type: 'p', content: 'Short content' }],
    }));
    expect(checks[5].status).toBe('warn');
  });

  it('fails word count when body is empty', () => {
    const checks = computeSEOScore(makePost({ body: [] }));
    expect(checks[5].status).toBe('fail');
  });
});

// ---------------------------------------------------------------------------
// seoCompletionCount
// ---------------------------------------------------------------------------
describe('seoCompletionCount', () => {
  it('returns passed and total counts', () => {
    const { passed, total } = seoCompletionCount(makePost());
    expect(total).toBe(6);
    expect(passed).toBe(6);
  });

  it('counts only pass status as passed', () => {
    const { passed } = seoCompletionCount(makePost({ meta_title: null, metaTitle: null }));
    expect(passed).toBe(5);
  });
});
