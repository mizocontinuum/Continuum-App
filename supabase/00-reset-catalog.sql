-- ============================================================================
-- Continuum Academy - 00 RESET CATALOG  **DESTRUCTIVE - READ FIRST**
-- ----------------------------------------------------------------------------
-- ONLY run this if supabase/01-catalog.sql refused to run because the old
-- uuid-keyed catalog tables are still present.
--
-- WHAT THIS DESTROYS
--   * every row in public.videos, public.disciplines, public.speakers
--   * every row in public.favorites and public.progress
--     (they reference videos by id, so those ids cannot survive)
--
-- WHAT THIS KEEPS
--   * auth.users - every account, password and session is untouched
--   * public.profiles, public.notifications - untouched
--
-- WHY IT IS NEEDED
-- The previous catalog used uuid primary keys. The apps use readable ids
-- ('leadership', 'v01', ...). A type change on a column that other tables
-- point at cannot be done in place without rewriting those rows, and doing it
-- silently is how data gets quietly mangled - so the migration stops and makes
-- you choose.
--
-- If you have real watchlist or resume data you want to keep, export it first:
--   select * from public.favorites;
--   select * from public.progress;
-- ============================================================================

begin;

drop table if exists public.progress   cascade;
drop table if exists public.favorites  cascade;
drop table if exists public.videos     cascade;
drop table if exists public.disciplines cascade;
drop table if exists public.speakers   cascade;

-- Policies and indexes are dropped with their tables. public.is_admin() is
-- left in place: 01-catalog.sql recreates it either way.
drop function if exists public.handle_new_user() cascade;

commit;

-- Next: run supabase/01-catalog.sql, then supabase/02-user-data.sql.
