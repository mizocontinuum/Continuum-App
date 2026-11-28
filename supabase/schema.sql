-- Continuum Academy Supabase Schema
-- Run this in Supabase Dashboard -> SQL Editor

create table if not exists public.disciplines (
  id text primary key,
  name text not null,
  slug text not null,
  goal text,
  blurb text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.videos (
  id text primary key,
  title text not null,
  category text not null default 'movies',
  discipline_id text references public.disciplines(id) on delete set null,
  season integer,
  episode integer,
  speaker text,
  minutes integer default 30,
  tag text,
  highlight text,
  rating integer,
  summary text,
  outcomes jsonb default '[]'::jsonb,
  thumbnail_url text,
  trailer_url text,
  video_url text,
  featured boolean default false,
  is_clip boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.cms_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null references public.videos(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, video_id)
);

create table if not exists public.user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null references public.videos(id) on delete cascade,
  position integer default 0,
  duration integer default 0,
  completed boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, video_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.password_reset_tokens (
  token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- If you already ran an older version of this schema, apply these ALTERs
-- instead of re-creating the tables:
--
-- alter table public.disciplines add column if not exists goal text;
-- alter table public.disciplines add column if not exists blurb text;
-- alter table public.videos add column if not exists tag text;
-- alter table public.videos add column if not exists highlight text;
-- alter table public.videos add column if not exists rating integer;
-- alter table public.videos add column if not exists outcomes jsonb default '[]'::jsonb;
-- alter table public.videos add column if not exists sort_order integer default 0;
-- alter table public.user_progress add column if not exists completed boolean default false;
