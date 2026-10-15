-- Pebble · family profiles for children (applies after 006)
--
-- New model: ONE parent login per family; children are PROFILES inside it
-- (no email/password for kids). Learning rows are keyed by learner id, which
-- is either an auth student's user id (legacy supported) or a child_profiles
-- id. So the FKs from learning tables to profiles are dropped (plain uuid +
-- index instead) and every learning table gains a managed-child policy.

-- ── 1. Child profiles ────────────────────────────────────────────────────────
create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  lessons_per_week int not null default 5,
  xp int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.child_profiles enable row level security;

drop policy if exists "parent manages own children" on public.child_profiles;
create policy "parent manages own children" on public.child_profiles
  for all using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

drop policy if exists "admin reads all" on public.child_profiles;
create policy "admin reads all" on public.child_profiles
  for select using (public.is_admin());

create index if not exists idx_child_profiles_parent on public.child_profiles (parent_id);

-- ── 2. Decouple learner ids (drop FKs, keep columns + index) ─────────────────
alter table public.attempts drop constraint if exists attempts_student_id_fkey;
alter table public.objective_mastery drop constraint if exists objective_mastery_student_id_fkey;
alter table public.earned_badges drop constraint if exists earned_badges_student_id_fkey;
alter table public.study_days drop constraint if exists study_days_student_id_fkey;
alter table public.challenge_days drop constraint if exists challenge_days_student_id_fkey;
alter table public.challenge_results drop constraint if exists challenge_results_student_id_fkey;

create index if not exists idx_attempts_student on public.attempts (student_id);
create index if not exists idx_mastery_student on public.objective_mastery (student_id);
create index if not exists idx_badges_student on public.earned_badges (student_id);
create index if not exists idx_days_student on public.study_days (student_id);
create index if not exists idx_chdays_student on public.challenge_days (student_id);
create index if not exists idx_chres_student on public.challenge_results (student_id);

-- ── 3. Managed-child policies on every learning table ────────────────────────
drop policy if exists "parent manages child rows" on public.attempts;
create policy "parent manages child rows" on public.attempts
  for all using (exists (
    select 1 from public.child_profiles c
    where c.id = attempts.student_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.child_profiles c
    where c.id = attempts.student_id and c.parent_id = auth.uid()
  ));

drop policy if exists "parent manages child rows" on public.objective_mastery;
create policy "parent manages child rows" on public.objective_mastery
  for all using (exists (
    select 1 from public.child_profiles c
    where c.id = objective_mastery.student_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.child_profiles c
    where c.id = objective_mastery.student_id and c.parent_id = auth.uid()
  ));

drop policy if exists "parent manages child rows" on public.earned_badges;
create policy "parent manages child rows" on public.earned_badges
  for all using (exists (
    select 1 from public.child_profiles c
    where c.id = earned_badges.student_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.child_profiles c
    where c.id = earned_badges.student_id and c.parent_id = auth.uid()
  ));

drop policy if exists "parent manages child rows" on public.study_days;
create policy "parent manages child rows" on public.study_days
  for all using (exists (
    select 1 from public.child_profiles c
    where c.id = study_days.student_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.child_profiles c
    where c.id = study_days.student_id and c.parent_id = auth.uid()
  ));

drop policy if exists "parent manages child rows" on public.challenge_days;
create policy "parent manages child rows" on public.challenge_days
  for all using (exists (
    select 1 from public.child_profiles c
    where c.id = challenge_days.student_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.child_profiles c
    where c.id = challenge_days.student_id and c.parent_id = auth.uid()
  ));

drop policy if exists "parent manages child rows" on public.challenge_results;
create policy "parent manages child rows" on public.challenge_results
  for all using (exists (
    select 1 from public.child_profiles c
    where c.id = challenge_results.student_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.child_profiles c
    where c.id = challenge_results.student_id and c.parent_id = auth.uid()
  ));

-- ── 4. Overview counts child profiles too ────────────────────────────────────
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
    'child_profiles', (select count(*) from public.child_profiles),
    'attempts', (select count(*) from public.attempts),
    'attempts_7d', (select count(*) from public.attempts where created_at > now() - interval '7 days'),
    'active_today', (select count(distinct student_id) from public.study_days where day = current_date),
    'active_7d', (select count(distinct student_id) from public.study_days where day > current_date - 7),
    'avg_score', (select round(avg(score_percent)) from public.attempts),
    'xp_total', (select coalesce(sum(xp), 0) from public.profiles)
      + (select coalesce(sum(xp), 0) from public.child_profiles),
    'badges', (select count(*) from public.earned_badges),
    'master_clears', (select count(distinct student_id) from public.attempts where lesson_id = 'lesson-master' and band <> 'revision'),
    'showdowns', (select count(*) from public.challenge_days),
    'objectives_mastered', (select count(*) from public.objective_mastery where mastered)
  ) into result;
  return result;
end;
$$;
