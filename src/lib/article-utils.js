/**
 * Article utilities — slugify headings, extract TOC, compute reading metrics.
 */

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Strip HTML tags from a string for word-counting purposes. */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Walk through structured body blocks and pull out h2/h3 entries for the TOC.
 * Returns [{ id, text, level }].
 */
export function extractTOC(blocks) {
  if (!blocks) return [];
  return blocks
    .filter((b) => b.type === 'h2' || b.type === 'h3')
    .map((b) => ({
      id: slugify(b.content),
      text: b.content,
      level: b.type === 'h2' ? 2 : 3,
    }));
}

/**
 * Approximate word count across all text-bearing blocks.
 */
export function computeWordCount(blocks) {
  if (!blocks) return 0;
  let words = 0;
  for (const block of blocks) {
    const text =
      block.content ||
      (block.items ? block.items.join(' ') : '') ||
      (block.rows ? block.rows.flat().join(' ') : '');
    words += stripHtml(text).split(/\s+/).filter(Boolean).length;
  }
  return words;
}

/**
 * Reading time in minutes (200 wpm).
 */
export function computeReadingTime(blocks) {
  return Math.max(1, Math.ceil(computeWordCount(blocks) / 200));
}

/**
 * Format a number with commas: 4820 → "4,820".
 */
export function formatNumber(n) {
  return n.toLocaleString('en-US');
}

/**
 * Format an ISO timestamp to "Month YYYY" for display.
 */
function formatDateLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Normalize a CMS post row (snake_case DB columns) into the shape
 * that ArticleTemplate and listing pages expect.
 */
export function normalizeCmsPost(row) {
  const body = row.body || [];
  const readTime = row.read_time_override || `${computeReadingTime(body)} min read`;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    description: row.excerpt || '',
    metaTitle: row.meta_title || '',
    metaDescription: row.meta_description || row.excerpt || '',
    canonicalUrl: row.canonical_url || '',
    ogImage: row.og_image || '',
    noindex: Boolean(row.noindex),
    schemaType: row.schema_type || 'Article',
    category: row.category_name || '',
    image: row.hero_image || '',
    heroAlt: row.hero_alt || row.title,
    heroCredit: row.hero_credit || '',
    date: formatDateLabel(row.published_at),
    isoDate: row.published_at ? row.published_at.split('T')[0] : null,
    readTime: typeof readTime === 'string' && readTime.includes('min') ? readTime : `${readTime} min read`,
    keyTakeaways: row.key_takeaways || [],
    faqs: row.faqs || [],
    footnotes: row.footnotes || [],
    relatedSlugs: [],
    body,
    type: row.type,
    _cms: true,
  };
}
