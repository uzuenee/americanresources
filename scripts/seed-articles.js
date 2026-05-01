/**
 * seed-articles.js
 *
 * Migrates every entry in src/data/articles.js into the Supabase `posts` table.
 * Types have already been swapped in articles.js (old guides → blog, old blogs → guide).
 *
 * Run:  npm run seed
 *   or: node scripts/seed-articles.js
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Load env vars from .env.local ──────────────────────────────
const envPath = resolve(__dirname, '..', '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Article data (already type-swapped) ────────────────────────
// Use pathToFileURL so Windows drive-letter paths (D:\...) become valid file:// URLs.
const articlesPath = resolve(__dirname, '..', 'src', 'data', 'articles.js');
const { articles } = await import(pathToFileURL(articlesPath).href);

// ── Parse "March 2025" → ISO date string ──────────────────────
function parseMonthYear(str) {
  if (!str) return new Date().toISOString();
  const d = new Date(`${str} 15`);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

// ── Ensure categories exist and return a name→id map ───────────
async function ensureCategories(articles) {
  const categoryNames = [...new Set(articles.map((a) => a.category).filter(Boolean))];
  const map = {};

  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Try to fetch existing
    const { data: existing } = await supabase
      .from('content_categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      map[name] = existing.id;
      console.log(`  Category "${name}" already exists (${existing.id})`);
      continue;
    }

    // Create
    const { data: created, error } = await supabase
      .from('content_categories')
      .insert({ name, slug, color: 'navy', sort_order: 0 })
      .select('id')
      .single();

    if (error) {
      console.warn(`  Could not create category "${name}": ${error.message}`);
      continue;
    }

    map[name] = created.id;
    console.log(`  Created category "${name}" (${created.id})`);
  }

  return map;
}

// ── Main seed ──────────────────────────────────────────────────
async function seed() {
  console.log('\nSeeding articles into Supabase CMS...\n');

  // 1. Categories
  console.log('Step 1: Ensuring categories...');
  const categoryMap = await ensureCategories(articles);

  // 2. Insert articles
  console.log('\nStep 2: Inserting articles...');
  let inserted = 0;
  let skipped = 0;

  for (const a of articles) {
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', a.slug)
      .maybeSingle();

    if (existing) {
      console.log(`  SKIP "${a.slug}" -- already exists (${existing.id})`);
      skipped++;
      continue;
    }

    const row = {
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt || a.description || null,
      type: a.type,                              // already swapped
      status: 'published',
      visibility: 'public',
      category_id: categoryMap[a.category] || null,
      body: a.body || [],
      key_takeaways: a.keyTakeaways || [],
      faqs: a.faqs || [],
      footnotes: a.footnotes || [],
      related_post_ids: [],                      // will link after all inserts
      hero_image: a.image || null,
      hero_alt: a.heroAlt || null,
      hero_credit: null,
      meta_title: null,
      meta_description: a.metaDescription || a.description || null,
      canonical_url: null,
      og_image: null,
      schema_type: 'Article',
      noindex: false,
      author: 'American Resources Team',
      read_time_override: a.readTime || null,
      disable_comments: false,
      published_at: parseMonthYear(a.date),
      scheduled_at: null,
    };

    const { data: post, error } = await supabase
      .from('posts')
      .insert(row)
      .select('id, slug')
      .single();

    if (error) {
      console.error(`  FAIL "${a.slug}": ${error.message}`);
      continue;
    }

    console.log(`  OK   "${a.slug}" -> ${post.id} (type: ${a.type})`);
    inserted++;
  }

  // 3. Link related posts by slug
  console.log('\nStep 3: Linking related posts...');

  // Build slug->id map from DB
  const { data: allPosts } = await supabase
    .from('posts')
    .select('id, slug');
  const slugToId = Object.fromEntries((allPosts || []).map((p) => [p.slug, p.id]));

  for (const a of articles) {
    if (!a.relatedSlugs || a.relatedSlugs.length === 0) continue;
    const postId = slugToId[a.slug];
    if (!postId) continue;

    const relatedIds = a.relatedSlugs
      .map((s) => slugToId[s])
      .filter(Boolean);

    if (relatedIds.length === 0) continue;

    const { error } = await supabase
      .from('posts')
      .update({ related_post_ids: relatedIds })
      .eq('id', postId);

    if (error) {
      console.warn(`  Could not link related for "${a.slug}": ${error.message}`);
    } else {
      console.log(`  Linked ${relatedIds.length} related posts for "${a.slug}"`);
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}\n`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
