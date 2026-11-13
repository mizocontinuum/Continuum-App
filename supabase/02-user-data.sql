-- ============================================================================
-- Continuum Academy - 02 USER DATA  (profiles, progress, favorites, alerts)
-- ----------------------------------------------------------------------------
-- Run AFTER supabase/01-catalog.sql (the FKs below reference public.videos).
-- Idempotent: running it twice changes nothing.
--
-- ACCESS MODEL - every table here is owner-scoped on auth.uid():
--   * a member reads and writes only their own rows
--   * no member can read another member's progress or watchlist
--   * admins may read every profile row, and nothing else
--
-- The API already rejects anonymous callers, but RLS is the second layer: it
-- still holds if PostgREST is ever reached directly with a member's token.
--
-- All FKs are ON DELETE CASCADE except where noted, so deleting an account
-- takes its data with it (GDPR-style erasure for free).
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

-- One row per auth user, created by the signup trigger in section 4.
-- `email` and `role` are intentionally NOT stored here: they live on
-- auth.users / app_metadata, which is the only place they can be trusted.
create table if not exists public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  tier        text        not null default 'Member',
  company     text,
  title       text,
  streak_days integer     not null default 0 check (streak_days >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Resume point per user + video.
create table if not exists public.progress (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  video_id   text        not null references public.videos (id) on delete cascade,
  position   integer     not null default 0 check (position >= 0),
  completed  boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

-- My List / watchlist.
create table if not exists public.favorites (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  video_id   text        not null references public.videos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

-- Notification bell feed.
create table if not exists public.notifications (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  kind       text        not null default 'system'
               check (kind in ('new', 'progress', 'live', 'system')),
  title      text        not null,
  body       text,
  read       boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists progress_user_idx       on public.progress (user_id, updated_at desc);
create index if not exists favorites_user_idx      on public.favorites (user_id, created_at desc);
create index if not exists notifications_user_idx  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id)
  where read = false;


-- ---------------------------------------------------------------------------
-- 2. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.progress      enable row level security;
alter table public.favorites     enable row level security;
alter table public.notifications enable row level security;


-- ---------------------------------------------------------------------------
-- 3. Policies
-- progress / favorites / notifications share one rule: the row's user_id must
-- equal the caller's auth.uid(). Generated in a loop so the three tables can
-- never drift apart.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['progress', 'favorites', 'notifications'] loop
    execute format('drop policy if exists "%1$s: owner can read" on public.%1$I', t);
    execute format(
      'create policy "%1$s: owner can read" on public.%1$I
         for select to authenticated using (auth.uid() = user_id)', t);

    execute format('drop policy if exists "%1$s: owner can insert" on public.%1$I', t);
    execute format(
      'create policy "%1$s: owner can insert" on public.%1$I
         for insert to authenticated with check (auth.uid() = user_id)', t);

    execute format('drop policy if exists "%1$s: owner can update" on public.%1$I', t);
    execute format(
      'create policy "%1$s: owner can update" on public.%1$I
         for update to authenticated
         using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);

    execute format('drop policy if exists "%1$s: owner can delete" on public.%1$I', t);
    execute format(
      'create policy "%1$s: owner can delete" on public.%1$I
         for delete to authenticated using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- profiles: a member owns exactly one row; admins may read all; nobody may
-- read another member's row. There is deliberately no DELETE policy - closing
-- an account is an auth operation, not a client-driven table write.
drop policy if exists "profiles: owner can read" on public.profiles;
create policy "profiles: owner can read"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles: admins can read" on public.profiles;
create policy "profiles: admins can read"
  on public.profiles for select to authenticated
  using (public.is_admin());

drop policy if exists "profiles: owner can insert" on public.profiles;
create policy "profiles: owner can insert"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles: owner can update" on public.profiles;
create policy "profiles: owner can update"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);


-- ---------------------------------------------------------------------------
-- 4. Signup trigger
-- Mirrors every new auth user into public.profiles so the app always has a row
-- to read, and seeds one welcome notification.
--
-- SECURITY DEFINER because this runs as the auth.users insert triggers it: at
-- that moment the owner-only RLS policy above would otherwise reject the row.
-- search_path is pinned to '' so the function cannot be hijacked by a shadow
-- table in a caller-controlled schema.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  insert into public.notifications (user_id, kind, title, body)
  values (
    new.id,
    'system',
    'Welcome to Continuum Academy',
    'Your membership is active. Browse the catalogue to begin your first masterclass.'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 5. Grants
-- ---------------------------------------------------------------------------
grant select, insert, update, delete
  on public.profiles, public.progress, public.favorites, public.notifications
  to authenticated;
revoke all
  on public.profiles, public.progress, public.favorites, public.notifications
  from anon;


-- ============================================================================
-- Optional: backfill profiles for accounts that predate this script.
-- Uncomment and run once if the signup trigger was not in place for them.
-- ============================================================================
-- insert into public.profiles (id, full_name)
-- select id, raw_user_meta_data ->> 'full_name'
--   from auth.users
--  on conflict (id) do nothing;
