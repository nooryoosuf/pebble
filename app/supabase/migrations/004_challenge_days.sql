-- Pebble · weekly-showdown completions (applies after 003)
-- Records the days a student cleared the weekly revision challenge.
-- Powers the Revision Ranger badge count and parent reports.

create table if not exists public.challenge_days (
  student_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  primary key (student_id, day)
);

alter table public.challenge_days enable row level security;

create policy "student own challenge days" on public.challenge_days
  for all using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create policy "parent reads challenge days" on public.challenge_days
  for select using (exists (
    select 1 from public.parent_links pl
    where pl.parent_id = auth.uid() and pl.student_id = challenge_days.student_id
  ));
