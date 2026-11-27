-- Continuum Academy Supabase Schema
-- Run this in Supabase Dashboard -> SQL Editor

create table if not exists public.disciplines (
  id text primary key,
  name text not null,
  slug text not null,
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
  summary text,
  thumbnail_url text,
  trailer_url text,
  video_url text,
  featured boolean default false,
  is_clip boolean default false,
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
