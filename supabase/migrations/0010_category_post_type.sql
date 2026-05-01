-- Add post_type to content_categories so categories can be scoped to blog or guide.
-- NULL means the category applies to both types.
alter table public.content_categories
  add column if not exists post_type text;
