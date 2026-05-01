-- CMS: content management tables for blog posts and guides.

-- ---------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------

CREATE TYPE content_status AS ENUM ('draft', 'published', 'scheduled');
CREATE TYPE content_type   AS ENUM ('blog', 'guide');

-- ---------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------

CREATE TABLE content_categories (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL UNIQUE,
  slug       text        NOT NULL UNIQUE,
  color      text        NOT NULL DEFAULT 'navy',
  sort_order integer     NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Seed the existing categories used in static data files.
INSERT INTO content_categories (name, slug, color, sort_order) VALUES
  ('How-To',        'how-to',        'navy',   0),
  ('Industry News',  'industry-news', 'copper', 1),
  ('Atlanta',        'atlanta',       'sage',   2);

-- ---------------------------------------------------------------
-- TAGS
-- ---------------------------------------------------------------

CREATE TABLE content_tags (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL UNIQUE,
  slug       text        NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------
-- POSTS
-- ---------------------------------------------------------------

CREATE TABLE posts (
  id                uuid           DEFAULT gen_random_uuid() PRIMARY KEY,
  title             text           NOT NULL,
  slug              text           NOT NULL UNIQUE,
  excerpt           text,
  type              content_type   NOT NULL DEFAULT 'blog',
  status            content_status NOT NULL DEFAULT 'draft',
  category_id       uuid           REFERENCES content_categories(id) ON DELETE SET NULL,

  -- Structured content
  body              jsonb          DEFAULT '[]'::jsonb,
  key_takeaways     jsonb          DEFAULT '[]'::jsonb,
  faqs              jsonb          DEFAULT '[]'::jsonb,
  footnotes         jsonb          DEFAULT '[]'::jsonb,
  related_post_ids  uuid[]         DEFAULT '{}',

  -- Hero image
  hero_image        text,
  hero_alt          text,
  hero_credit       text,

  -- SEO
  meta_title        text,
  meta_description  text,
  canonical_url     text,
  og_image          text,
  schema_type       text           DEFAULT 'Article',
  noindex           boolean        DEFAULT false,

  -- Settings
  author            text           DEFAULT 'American Resources Team',
  read_time_override text,
  visibility        text           DEFAULT 'public',
  disable_comments  boolean        DEFAULT false,

  -- Dates
  published_at      timestamptz,
  scheduled_at      timestamptz,
  created_at        timestamptz    DEFAULT now(),
  updated_at        timestamptz    DEFAULT now(),

  -- Stats
  view_count        integer        DEFAULT 0
);

CREATE INDEX idx_posts_status      ON posts (status);
CREATE INDEX idx_posts_type        ON posts (type);
CREATE INDEX idx_posts_slug        ON posts (slug);
CREATE INDEX idx_posts_category    ON posts (category_id);
CREATE INDEX idx_posts_published   ON posts (published_at DESC) WHERE status = 'published';

-- ---------------------------------------------------------------
-- POST ↔ TAG JUNCTION
-- ---------------------------------------------------------------

CREATE TABLE post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  uuid REFERENCES content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ---------------------------------------------------------------
-- AUTO-UPDATE updated_at
-- ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_post_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_timestamp();

-- ---------------------------------------------------------------
-- RLS (admin-only write, public read for published)
-- ---------------------------------------------------------------

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "published_posts_readable"
  ON posts FOR SELECT
  USING (status = 'published' AND visibility = 'public');

-- Admins can do everything with posts
CREATE POLICY "admins_all_posts"
  ON posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Categories/tags readable by everyone, writable by admins
CREATE POLICY "categories_readable" ON content_categories FOR SELECT USING (true);
CREATE POLICY "admins_manage_categories"
  ON content_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "tags_readable" ON content_tags FOR SELECT USING (true);
CREATE POLICY "admins_manage_tags"
  ON content_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "post_tags_readable" ON post_tags FOR SELECT USING (true);
CREATE POLICY "admins_manage_post_tags"
  ON post_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
