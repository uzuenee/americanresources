# Supabase backend

This folder holds the database schema and RLS policies for the American
Resources customer portal. The Next.js app talks to Supabase via
`@supabase/ssr` (see `src/lib/supabase/`).

## Local development

1. Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).
2. From the project root:

   ```bash
   supabase start        # boots Postgres + Auth + Studio in Docker
   supabase db reset     # applies every file in migrations/ in order
   ```

3. Copy the anon and service-role keys printed by `supabase start` into
   `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. `npm run dev` as usual.

Studio runs at [http://localhost:54323](http://localhost:54323). Use it to
inspect rows, run ad-hoc SQL, and view the generated auth users table.

## Migrations

Files run in lexical order. Keep the prefixes (`0001_`, `0002_`, ...) so new
migrations slot in correctly.

| File                 | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `0001_schema.sql`    | Enums, tables, indexes, views, updated_at triggers.      |
| `0002_helpers.sql`   | JWT claim helpers used by RLS (`current_role()` etc.).   |
| `0003_triggers.sql`  | `handle_new_user`, `sync_user_claims`, activity writers. |
| `0004_rls.sql`       | Row-level security policies for every public table.      |

## Deploying to a hosted project

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Creating an admin user

Admin accounts do not self-signup. After a user signs up through the portal,
flip their profile to admin from the Studio SQL editor:

```sql
update public.profiles
set role = 'admin',
    customer_id = null,
    title = 'Dispatcher'
where id = (select id from auth.users where email = 'you@recyclinggroup.com');
```

You will also want to delete the auto-created customer row (if one was
created) so it doesn't show in the dispatch list:

```sql
delete from public.customers
where id not in (select customer_id from public.profiles where customer_id is not null);
```

The JWT claim sync trigger handles the rest; the admin will need to sign out
and back in so their new token picks up `app_metadata.role = 'admin'`.
