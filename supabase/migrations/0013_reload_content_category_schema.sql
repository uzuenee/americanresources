-- Ensure PostgREST sees the content_categories.post_type column after deploys.
alter table public.content_categories
  add column if not exists post_type text;

notify pgrst, 'reload schema';
