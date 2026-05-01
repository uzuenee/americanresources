import { describe, it, expect } from 'vitest';
import {
  slugify,
  extractTOC,
  computeWordCount,
  computeReadingTime,
  formatNumber,
  normalizeCmsPost,
} from '@/lib/article-utils';

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------
describe('slugify', () => {
  it('converts text to lowercase kebab-case', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces multiple non-alphanumeric chars with a single dash', () => {
    expect(slugify('Foo  &  Bar')).toBe('foo-bar');
  });

  it('strips leading and trailing dashes', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('handles numbers', () => {
    expect(slugify('Section 3: Important')).toBe('section-3-important');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles special characters', () => {
    expect(slugify("What's the Deal?")).toBe('what-s-the-deal');
  });

  it('collapses consecutive special chars into single dash', () => {
    expect(slugify('a!!!b')).toBe('a-b');
  });
});

// ---------------------------------------------------------------------------
// extractTOC
// ---------------------------------------------------------------------------
describe('extractTOC', () => {
  it('extracts h2 and h3 blocks', () => {
    const blocks = [
      { type: 'h2', content: 'Getting Started' },
      { type: 'p', content: 'Some text' },
      { type: 'h3', content: 'Prerequisites' },
      { type: 'h2', content: 'Installation' },
    ];

    const toc = extractTOC(blocks);
    expect(toc).toHaveLength(3);
    expect(toc[0]).toEqual({ id: 'getting-started', text: 'Getting Started', level: 2 });
    expect(toc[1]).toEqual({ id: 'prerequisites', text: 'Prerequisites', level: 3 });
    expect(toc[2]).toEqual({ id: 'installation', text: 'Installation', level: 2 });
  });

  it('ignores non-heading blocks', () => {
    const blocks = [
      { type: 'p', content: 'text' },
      { type: 'list', items: ['a', 'b'] },
      { type: 'image', src: '/img.png' },
    ];
    expect(extractTOC(blocks)).toHaveLength(0);
  });

  it('returns empty array for null/undefined input', () => {
    expect(extractTOC(null)).toEqual([]);
    expect(extractTOC(undefined)).toEqual([]);
  });

  it('returns empty array for empty blocks', () => {
    expect(extractTOC([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// computeWordCount
// ---------------------------------------------------------------------------
describe('computeWordCount', () => {
  it('counts words in paragraph blocks', () => {
    const blocks = [
      { type: 'p', content: 'Hello world foo bar' },
      { type: 'p', content: 'Another sentence here' },
    ];
    expect(computeWordCount(blocks)).toBe(7);
  });

  it('counts words in list items', () => {
    const blocks = [
      { type: 'list', items: ['first item', 'second item', 'third item'] },
    ];
    expect(computeWordCount(blocks)).toBe(6);
  });

  it('counts words in table rows', () => {
    const blocks = [
      { type: 'table', rows: [['cell one', 'cell two'], ['cell three', 'cell four']] },
    ];
    expect(computeWordCount(blocks)).toBe(8);
  });

  it('strips HTML tags before counting', () => {
    const blocks = [
      { type: 'p', content: '<strong>Hello</strong> <em>world</em>' },
    ];
    expect(computeWordCount(blocks)).toBe(2);
  });

  it('returns 0 for null/undefined input', () => {
    expect(computeWordCount(null)).toBe(0);
    expect(computeWordCount(undefined)).toBe(0);
  });

  it('returns 0 for empty blocks', () => {
    expect(computeWordCount([])).toBe(0);
  });

  it('handles blocks with no text content', () => {
    const blocks = [{ type: 'hr' }, { type: 'image', src: '/test.png' }];
    expect(computeWordCount(blocks)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeReadingTime
// ---------------------------------------------------------------------------
describe('computeReadingTime', () => {
  it('returns minimum of 1 minute for very short content', () => {
    const blocks = [{ type: 'p', content: 'Hello' }];
    expect(computeReadingTime(blocks)).toBe(1);
  });

  it('calculates reading time at 200 wpm', () => {
    const longText = Array(400).fill('word').join(' ');
    const blocks = [{ type: 'p', content: longText }];
    expect(computeReadingTime(blocks)).toBe(2);
  });

  it('rounds up partial minutes', () => {
    const text = Array(201).fill('word').join(' ');
    const blocks = [{ type: 'p', content: text }];
    expect(computeReadingTime(blocks)).toBe(2);
  });

  it('returns 1 for empty/null blocks', () => {
    expect(computeReadingTime(null)).toBe(1);
    expect(computeReadingTime([])).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// formatNumber
// ---------------------------------------------------------------------------
describe('formatNumber', () => {
  it('adds commas to thousands', () => {
    expect(formatNumber(4820)).toBe('4,820');
  });

  it('handles millions', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles small numbers without commas', () => {
    expect(formatNumber(42)).toBe('42');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// normalizeCmsPost
// ---------------------------------------------------------------------------
describe('normalizeCmsPost', () => {
  const baseRow = {
    id: 'abc123',
    slug: 'test-post',
    title: 'Test Post Title',
    excerpt: 'A test excerpt',
    type: 'blog',
    body: [
      { type: 'p', content: 'Hello world' },
      { type: 'h2', content: 'Section One' },
    ],
    hero_image: '/images/hero.jpg',
    hero_alt: 'Hero alt text',
    hero_credit: 'Photo by someone',
    published_at: '2025-03-15T10:00:00Z',
    meta_title: 'SEO Title',
    meta_description: 'SEO Description',
    canonical_url: '',
    og_image: '',
    noindex: false,
    schema_type: 'Article',
    read_time_override: null,
    key_takeaways: ['Takeaway 1'],
    faqs: [{ question: 'Q?', answer: 'A.' }],
    footnotes: ['Footnote 1'],
    category_name: 'Recycling',
  };

  it('maps snake_case DB columns to camelCase', () => {
    const post = normalizeCmsPost(baseRow);
    expect(post.id).toBe('abc123');
    expect(post.slug).toBe('test-post');
    expect(post.title).toBe('Test Post Title');
    expect(post.excerpt).toBe('A test excerpt');
    expect(post.metaTitle).toBe('SEO Title');
    expect(post.metaDescription).toBe('SEO Description');
    expect(post.heroAlt).toBe('Hero alt text');
    expect(post.heroCredit).toBe('Photo by someone');
    expect(post.category).toBe('Recycling');
    expect(post.image).toBe('/images/hero.jpg');
    expect(post.type).toBe('blog');
  });

  it('marks the post as _cms: true', () => {
    expect(normalizeCmsPost(baseRow)._cms).toBe(true);
  });

  it('computes reading time if not overridden', () => {
    const post = normalizeCmsPost(baseRow);
    expect(post.readTime).toMatch(/\d+ min read/);
  });

  it('uses read_time_override when provided', () => {
    const row = { ...baseRow, read_time_override: '5 min read' };
    expect(normalizeCmsPost(row).readTime).toBe('5 min read');
  });

  it('appends "min read" if override is just a number', () => {
    const row = { ...baseRow, read_time_override: 7 };
    expect(normalizeCmsPost(row).readTime).toBe('7 min read');
  });

  it('formats date as "Month YYYY"', () => {
    const post = normalizeCmsPost(baseRow);
    expect(post.date).toBe('March 2025');
  });

  it('extracts isoDate from published_at', () => {
    expect(normalizeCmsPost(baseRow).isoDate).toBe('2025-03-15');
  });

  it('handles missing optional fields with defaults', () => {
    const minimal = { id: '1', slug: 'x', title: 'X', type: 'blog' };
    const post = normalizeCmsPost(minimal);
    expect(post.excerpt).toBe('');
    expect(post.description).toBe('');
    expect(post.keyTakeaways).toEqual([]);
    expect(post.faqs).toEqual([]);
    expect(post.footnotes).toEqual([]);
    expect(post.body).toEqual([]);
    expect(post.relatedSlugs).toEqual([]);
  });

  it('uses title as heroAlt fallback when hero_alt is missing', () => {
    const row = { ...baseRow, hero_alt: null };
    expect(normalizeCmsPost(row).heroAlt).toBe('Test Post Title');
  });

  it('uses excerpt as metaDescription fallback', () => {
    const row = { ...baseRow, meta_description: null };
    expect(normalizeCmsPost(row).metaDescription).toBe('A test excerpt');
  });
});
