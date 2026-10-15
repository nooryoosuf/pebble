-- Pebble · in-app admin console backend (applies after 004)
--
-- A tiny admins registry (NOT a profile role, so the role lock in 003 is
-- untouched). Admins get read access to every family's learning rows plus a
-- single overview RPC. Nobody can self-promote: the only way in is a
-- service_role / dashboard SQL insert by the site owner:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'owner@example.com';

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- anyone may check their OWN admin row (used by the app to reveal the tab)
drop policy if exists "own admin row" on public.admins;
create policy "own admin row" on public.admins
  for select using (auth.uid() = user_id);

create or replace function public.is_admin() returns boolean
  language sql security definer stable as
$$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- read-all policies (one per learning table; families keep their own policies too)
drop policy if exists "admin reads all" on public.profiles;
create policy "admin reads all" on public.profiles
  for select using (public.is_admin());

drop policy if exists "admin reads all" on public.parent_links;
create policy "admin reads all" on public.parent_links
  for select using (public.is_admin());

drop policy if exists "admin reads all" on public.attempts;
create policy "admin reads all" on public.attempts
  for select using (public.is_admin());

drop policy if exists "admin reads all" on public.objective_mastery;
create policy "admin reads all" on public.objective_mastery
  for select using (public.is_admin());

drop policy if exists "admin reads all" on public.earned_badges;
create policy "admin reads all" on public.earned_badges
  for select using (public.is_admin());

drop policy if exists "admin reads all" on public.study_days;
create policy "admin reads all" on public.study_days
  for select using (public.is_admin());

drop policy if exists "admin reads all" on public.challenge_days;
create policy "admin reads all" on public.challenge_days
  for select using (public.is_admin());

-- platform overview in one round trip (admin-only; SECURITY DEFINER + guard)
create or replace function public.admin_overview() returns jsonb
  language plpgsql security definer stable as
$$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admins only';
  end if;
  select jsonb_build_object(
    'parents', (select count(*) from public.profiles where role = 'parent'),
    'students', (select count(*) from public.profiles where role = 'student'),
    'attempts', (select count(*) from public.attempts),
    'attempts_7d', (select count(*) from public.attempts where created_at > now() - interval '7 days'),
    'active_today', (select count(distinct student_id) from public.study_days where day = current_date),
    'active_7d', (select count(distinct student_id) from public.study_days where day > current_date - 7),
    'avg_score', (select round(avg(score_percent)) from public.attempts),
    'xp_total', (select coalesce(sum(xp), 0) from public.profiles),
    'badges', (select count(*) from public.earned_badges),
    'master_clears', (select count(distinct student_id) from public.attempts where lesson_id = 'lesson-master' and band <> 'revision'),
    'showdowns', (select count(*) from public.challenge_days),
    'objectives_mastered', (select count(*) from public.objective_mastery where mastered)
  ) into result;
  return result;
end;
$$;
