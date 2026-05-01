-- Seed default content categories for blog and guide types.

-- Blog categories
insert into public.content_categories (name, slug, color, sort_order, post_type)
values
  ('How-To', 'how-to', 'navy', 1, 'blog'),
  ('Industry News', 'industry-news', 'accent', 2, 'blog'),
  ('Atlanta', 'atlanta', 'sage', 3, 'blog')
on conflict (slug) do update set post_type = excluded.post_type;

-- Guide categories
insert into public.content_categories (name, slug, color, sort_order, post_type)
values
  ('Recycling', 'recycling', 'sage', 1, 'guide'),
  ('Compliance', 'compliance', 'navy', 2, 'guide'),
  ('Data Security', 'data-security', 'accent', 3, 'guide')
on conflict (slug) do update set post_type = excluded.post_type;
