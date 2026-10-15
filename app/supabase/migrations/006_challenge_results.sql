-- Pebble · weekly showdown results (applies after 005)
-- Stores each week's showdown score so students see their result until the
-- next weekly challenge, can retry for a better score (best kept), and
-- parents/admins see history. One row per student per ISO week.

create table if not exists public.challenge_results (
  student_id uuid not null references public.profiles(id) on delete cascade,
  week_key text not null,
  correct int not null default 0,
  total int not null default 0,
  score_percent int not null default 0,
  created_at timestamptz not null default now(),
  primary key (student_id, week_key)
);

alter table public.challenge_results enable row level security;

create policy "student own challenge results" on public.challenge_results
  for all using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create policy "parent reads challenge results" on public.challenge_results
  for select using (exists (
    select 1 from public.parent_links pl
    where pl.parent_id = auth.uid() and pl.student_id = challenge_results.student_id
  ));

create policy "admin reads all" on public.challenge_results
  for select using (public.is_admin());
