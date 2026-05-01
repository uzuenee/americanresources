-- Fix category post_type values to match the type swap in articles.js.
-- Blog articles (big, in-depth) use: Recycling, Compliance, Data Security
-- Guide articles (small, quick reads) use: How-To, Industry News, Atlanta

update public.content_categories set post_type = 'blog'
where slug in ('recycling', 'compliance', 'data-security');

update public.content_categories set post_type = 'guide'
where slug in ('how-to', 'industry-news', 'atlanta');
