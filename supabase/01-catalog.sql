-- ============================================================================
-- Continuum Academy - 01 CATALOG  (disciplines, speakers, videos)
-- ----------------------------------------------------------------------------
-- Run in the Supabase SQL Editor (Dashboard -> SQL -> New query).
-- Idempotent: running it twice changes nothing.
--
-- ACCESS MODEL (enforced in Postgres, not only in the API):
--   * role "authenticated"          -> may READ the catalog
--   * app_metadata.role = "admin"   -> may CREATE / UPDATE / DELETE
--   * role "anon"                   -> sees nothing
--
-- Primary keys are TEXT, not uuid, on purpose: they are the readable ids the
-- clients already use ('leadership', 's1', 'v01'). Keeping them stable means
-- no id migration in either app, which removes a whole class of mapping bugs.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0. Legacy guard
-- The previous revision of this schema used uuid primary keys. If that shape
-- is still present, stop here rather than half-migrating: user rows in
-- progress/favorites reference those uuids and silently changing the type
-- would corrupt them. Run supabase/00-reset-catalog.sql first if the old
-- catalog holds no data you need.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name  in ('disciplines', 'videos')
       and column_name = 'id'
       and data_type   = 'uuid'
  ) then
    raise exception using
      message = 'Legacy uuid-shaped catalog detected.',
      detail  = 'public.disciplines/public.videos still use uuid primary keys.',
      hint    = 'Run supabase/00-reset-catalog.sql to drop the old catalog, then run this file again.';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 1. Admin helper
-- Reads app_metadata.role from the verified JWT. app_metadata can only be
-- written by an admin (Admin API / service role) - unlike user_metadata, which
-- the account holder can edit themselves, so it must never grant privileges.
-- Defined before the policies that call it.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin';
$$;


-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- A learning discipline (a "channel" of masterclasses).
create table if not exists public.disciplines (
  id          text        primary key,
  name        text        not null,
  goal        text,
  description text,
  emoji       text,
  accent      text,
  accent_deep text,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- An instructor / expert featured across the catalogue.
create table if not exists public.speakers (
  id         text        primary key,
  name       text        not null,
  title      text,
  company    text,
  bio        text,
  avatar_url text,
  sort_order integer     not null default 0,
  created_at timestamptz not null default now()
);

-- A single masterclass or short insight clip.
create table if not exists public.videos (
  id            text        primary key,
  discipline_id text        not null references public.disciplines (id) on delete cascade,
  -- Nullable + ON DELETE SET NULL: retiring a speaker must never delete the
  -- masterclass itself.
  speaker_id    text        references public.speakers (id) on delete set null,
  title         text        not null,
  subtitle      text,
  description   text,
  duration_sec  integer     not null default 0 check (duration_sec >= 0),
  poster_url    text,
  video_url     text,
  tags          text[]      not null default '{}',
  year          integer,
  rating        numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  views         integer     not null default 0 check (views >= 0),
  is_clip       boolean     not null default false,
  -- Curated hero/Hero-row flag. Kept in the database (not derived from rating)
  -- so the website and the mobile app show the same spotlight without either
  -- client owning a hard-coded id list.
  featured      boolean     not null default false,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists videos_discipline_idx on public.videos (discipline_id, sort_order);
create index if not exists videos_speaker_idx    on public.videos (speaker_id);
create index if not exists videos_clip_idx       on public.videos (is_clip) where is_clip;
create index if not exists videos_featured_idx   on public.videos (featured) where featured;
-- Backs the /api/catalog?q= search below (title + subtitle + description).
create index if not exists videos_search_idx     on public.videos
  using gin (to_tsvector('english',
    coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(description, '')));


-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.disciplines enable row level security;
alter table public.speakers    enable row level security;
alter table public.videos      enable row level security;

-- ---------------------------------------------------------------------------
-- 4. Policies
-- Written as a loop over the three tables: identical rules, and adding a
-- fourth catalog table later means one line, not thirty.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['disciplines', 'speakers', 'videos'] loop
    execute format('drop policy if exists "%1$s: authenticated can read" on public.%1$I', t);
    execute format(
      'create policy "%1$s: authenticated can read" on public.%1$I
         for select to authenticated using (true)', t);

    execute format('drop policy if exists "%1$s: admins can insert" on public.%1$I', t);
    execute format(
      'create policy "%1$s: admins can insert" on public.%1$I
         for insert to authenticated with check (public.is_admin())', t);

    execute format('drop policy if exists "%1$s: admins can update" on public.%1$I', t);
    execute format(
      'create policy "%1$s: admins can update" on public.%1$I
         for update to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);

    execute format('drop policy if exists "%1$s: admins can delete" on public.%1$I', t);
    execute format(
      'create policy "%1$s: admins can delete" on public.%1$I
         for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Grants
-- Supabase's default privileges already cover new tables in public, but stating
-- them explicitly means this script behaves the same on a project whose
-- default privileges were altered. RLS still constrains every row.
-- "anon" deliberately gets nothing: the catalog is for signed-in members.
-- ---------------------------------------------------------------------------
grant select on public.disciplines, public.speakers, public.videos to authenticated;
grant insert, update, delete on public.disciplines, public.speakers, public.videos to authenticated;
revoke all on public.disciplines, public.speakers, public.videos from anon;


-- ============================================================================
-- Optional: promote an existing account to admin.
-- replace the email, uncomment, run once.
-- ============================================================================
-- update auth.users
--    set raw_app_meta_data =
--          coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
--  where email = 'admin@continuum.com.ph';
