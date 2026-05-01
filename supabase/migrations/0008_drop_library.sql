-- ============================================================================
-- 0008_drop_library.sql
-- Reverses 0007_library.sql and 0008_library_storage.sql entirely.
-- Drops all tables, policies, triggers, indexes, and the storage bucket
-- that were created by those experimental migrations.
-- ============================================================================

-- 1. Storage policies ------------------------------------------------------
-- The bucket + objects must be deleted via the Supabase Storage API or
-- dashboard — direct DELETE on storage.objects / storage.buckets is blocked
-- by the protect_delete() trigger. Only drop the RLS policies here.

drop policy if exists "library_media: admin uploads"  on storage.objects;
drop policy if exists "library_media: admin updates"  on storage.objects;
drop policy if exists "library_media: admin deletes"  on storage.objects;

-- 2. RLS policies ----------------------------------------------------------

create or replace function pg_temp.drop_policy_if_table_exists(policy_name text, table_name text)
returns void
language plpgsql
as $$
declare
  relation regclass;
begin
  relation := to_regclass(table_name);
  if relation is not null then
    execute format('drop policy if exists %I on %s', policy_name, relation);
  end if;
end;
$$;

create or replace function pg_temp.drop_trigger_if_table_exists(trigger_name text, table_name text)
returns void
language plpgsql
as $$
declare
  relation regclass;
begin
  relation := to_regclass(table_name);
  if relation is not null then
    execute format('drop trigger if exists %I on %s', trigger_name, relation);
  end if;
end;
$$;

-- article_analytics_queries
select pg_temp.drop_policy_if_table_exists('article_analytics_queries: admin all', 'public.article_analytics_queries');

-- article_analytics_daily
select pg_temp.drop_policy_if_table_exists('article_analytics_daily: admin all', 'public.article_analytics_daily');

-- redirects
select pg_temp.drop_policy_if_table_exists('redirects: public reads', 'public.redirects');
select pg_temp.drop_policy_if_table_exists('redirects: admin writes', 'public.redirects');

-- article_revisions
select pg_temp.drop_policy_if_table_exists('article_revisions: admin all', 'public.article_revisions');

-- article_related
select pg_temp.drop_policy_if_table_exists('article_related: public reads', 'public.article_related');
select pg_temp.drop_policy_if_table_exists('article_related: admin writes', 'public.article_related');

-- article_tags
select pg_temp.drop_policy_if_table_exists('article_tags: public reads', 'public.article_tags');
select pg_temp.drop_policy_if_table_exists('article_tags: admin writes', 'public.article_tags');

-- articles
select pg_temp.drop_policy_if_table_exists('articles: public reads published', 'public.articles');
select pg_temp.drop_policy_if_table_exists('articles: admin reads all', 'public.articles');
select pg_temp.drop_policy_if_table_exists('articles: admin inserts', 'public.articles');
select pg_temp.drop_policy_if_table_exists('articles: admin updates', 'public.articles');
select pg_temp.drop_policy_if_table_exists('articles: admin deletes', 'public.articles');

-- media
select pg_temp.drop_policy_if_table_exists('media: public reads', 'public.media');
select pg_temp.drop_policy_if_table_exists('media: admin writes', 'public.media');

-- tags
select pg_temp.drop_policy_if_table_exists('tags: public reads', 'public.tags');
select pg_temp.drop_policy_if_table_exists('tags: admin writes', 'public.tags');

-- categories
select pg_temp.drop_policy_if_table_exists('categories: public reads', 'public.categories');
select pg_temp.drop_policy_if_table_exists('categories: admin writes', 'public.categories');

-- 3. Triggers --------------------------------------------------------------

select pg_temp.drop_trigger_if_table_exists('media_touch_updated_at', 'public.media');
select pg_temp.drop_trigger_if_table_exists('articles_touch_updated_at', 'public.articles');

-- 4. Tables (reverse dependency order) -------------------------------------

drop table if exists public.article_analytics_queries cascade;
drop table if exists public.article_analytics_daily   cascade;
drop table if exists public.article_revisions         cascade;
drop table if exists public.article_related           cascade;
drop table if exists public.article_tags              cascade;
drop table if exists public.redirects                 cascade;
drop table if exists public.articles                  cascade;
drop table if exists public.media                     cascade;
drop table if exists public.tags                      cascade;
drop table if exists public.categories                cascade;
