-- Pebble · Supabase schema & Row Level Security
-- Curriculum content lives in the app bundle (src/data/curriculum.ts, IDs preserved).
-- This migration stores ONLY learner activity; scores/mastery are computed
-- server-side by the `grade_attempt` trigger — client-submitted scores are ignored.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner',
  role text not null default 'student' check (role in ('student','parent')),
  lessons_per_week int not null default 5,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(parent_id, student_id),
  check (parent_id <> student_id)
);

-- Answer keys live server-side so grading can't be spoofed from the client.
create table if not exists public.answer_keys (
  question_id text primary key,
  lesson_id text not null,
  objective_id text not null,
  kind text not null check (kind in ('mcq','tf')),
  correct_mcq text check (correct_mcq in ('A','B','C','D')),
  correct_tf boolean
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  mcq_answers jsonb not null default '{}',
  tf_answers jsonb not null default '{}',
  short_answer_self_marks jsonb not null default '{}',
  challenge_done boolean not null default false,
  -- graded server-side; clients may NOT set these (trigger overwrites):
  auto_correct int not null default 0,
  auto_total int not null default 0,
  score_percent int not null default 0,
  band text not null default 'revision' check (band in ('progress','practice','revision')),
  xp_earned int not null default 0,
  duration_seconds int,
  created_at timestamptz not null default now()
);

create table if not exists public.objective_mastery (
  student_id uuid not null references public.profiles(id) on delete cascade,
  objective_id text not null,
  attempts int not null default 0,
  best_score int not null default 0,
  mastered boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (student_id, objective_id)
);

create table if not exists public.earned_badges (
  student_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  primary key (student_id, badge_id)
);

create table if not exists public.study_days (
  student_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  primary key (student_id, day)
);

-- ── Authoritative grading trigger ────────────────────────────────────────────
create or replace function public.grade_attempt() returns trigger as $$
declare
  r record; v_mcq text; v_tf boolean; v_tb boolean;
  c int := 0; t int := 0; pct int := 0; xp int := 0;
  is_first boolean := true;
begin
  for r in select * from public.answer_keys where lesson_id = NEW.lesson_id loop
    if r.kind = 'mcq' then
      t := t + 1;
      v_mcq := upper(coalesce(NEW.mcq_answers ->> r.question_id, ''));
      if v_mcq = r.correct_mcq then c := c + 1; end if;
    elsif r.kind = 'tf' then
      t := t + 1;
      if (NEW.tf_answers ? r.question_id) then
        v_tb := (NEW.tf_answers ->> r.question_id)::boolean;
        if v_tb = r.correct_tf then c := c + 1; end if;
      end if;
    end if;
  end loop;
  if t > 0 then pct := round(c::numeric / t::numeric * 100); end if;

  select not exists (
    select 1 from public.attempts
    where student_id = NEW.student_id and lesson_id = NEW.lesson_id
  ) into is_first;

  NEW.auto_correct := c;
  NEW.auto_total := t;
  NEW.score_percent := pct;
  NEW.band := case when pct >= 80 then 'progress' when pct >= 50 then 'practice' else 'revision' end;
  NEW.xp_earned := 20 + round(pct::numeric/100*60) + (case when is_first then 20 else 5 end)
                   + (case when pct >= 80 then 20 when pct >= 50 then 10 else 0 end);
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_grade_attempt on public.attempts;
create trigger trg_grade_attempt
  before insert on public.attempts
  for each row execute function public.grade_attempt();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.parent_links enable row level security;
alter table public.answer_keys enable row level security;
alter table public.attempts enable row level security;
alter table public.objective_mastery enable row level security;
alter table public.earned_badges enable row level security;
alter table public.study_days enable row level security;

-- profiles: own row; parents may read linked students' rows
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "parent reads linked student profile" on public.profiles
  for select using (exists (
    select 1 from public.parent_links pl
    where pl.parent_id = auth.uid() and pl.student_id = profiles.id
  ));

-- parent_links: readable by either party; creatable by parent
create policy "read own links" on public.parent_links
  for select using (auth.uid() = parent_id or auth.uid() = student_id);
create policy "parent creates link" on public.parent_links
  for insert with check (auth.uid() = parent_id);

-- answer keys: readable by any authenticated user (needed to render questions? No —
-- questions render from the app bundle; keys stay hidden). Only service_role seeds.
create policy "no client access to keys" on public.answer_keys
  for all using (false) with check (false);

-- attempts: students insert/select own; parents select linked student's
create policy "student own attempts" on public.attempts
  for all using (auth.uid() = student_id)
  with check (auth.uid() = student_id);
create policy "parent reads student attempts" on public.attempts
  for select using (exists (
    select 1 from public.parent_links pl
    where pl.parent_id = auth.uid() and pl.student_id = attempts.student_id
  ));

-- mastery / badges / study days: same pattern
create policy "student own mastery" on public.objective_mastery
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy "parent reads mastery" on public.objective_mastery
  for select using (exists (
    select 1 from public.parent_links pl
    where pl.parent_id = auth.uid() and pl.student_id = objective_mastery.student_id
  ));

create policy "student own badges" on public.earned_badges
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy "parent reads badges" on public.earned_badges
  for select using (exists (
    select 1 from public.parent_links pl
    where pl.parent_id = auth.uid() and pl.student_id = earned_badges.student_id
  ));

create policy "student own days" on public.study_days
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy "parent reads days" on public.study_days
  for select using (exists (
    select 1 from public.parent_links pl
    where pl.parent_id = auth.uid() and pl.student_id = study_days.student_id
  ));

-- ── Seed answer keys (mirrors chapter content files; stable IDs) ─────────────
insert into public.answer_keys (question_id, lesson_id, objective_id, kind, correct_mcq, correct_tf) values
  ('mcq-01-01','lesson-1.1','lo-1.1.1','mcq','B',null),
  ('mcq-01-03','lesson-1.1','lo-1.1.3','mcq','B',null),
  ('tf-01-01','lesson-1.1','lo-1.1.2','tf',null,false),
  ('mcq-01-02','lesson-1.2','lo-1.2.2','mcq','C',null),
  ('tf-01-02','lesson-1.3','lo-1.3.1','tf',null,true),
  ('mcq-02-01','lesson-2.1','lo-2.1.2','mcq','C',null),
  ('mcq-02-02','lesson-2.1','lo-2.1.3','mcq','B',null),
  ('tf-02-02','lesson-2.1','lo-2.1.1','tf',null,false),
  ('tf-02-01','lesson-2.2','lo-2.2.1','tf',null,true),
  ('mcq-02-03','lesson-2.3','lo-2.3.1','mcq','C',null),
  ('mcq-03-02','lesson-3.2','lo-3.2.1','mcq','C',null),
  ('mcq-03-01','lesson-3.3','lo-3.3.1','mcq','B',null),
  ('tf-03-01','lesson-3.3','lo-3.3.2','tf',null,false),
  ('mcq-03-03','lesson-3.4','lo-3.4.1','mcq','B',null),
  ('tf-03-02','lesson-3.4','lo-3.4.1','tf',null,true),
  ('mcq-04-01','lesson-4.1','lo-4.1.2','mcq','B',null),
  ('mcq-04-02','lesson-4.1','lo-4.1.1','mcq','C',null),
  ('tf-04-01','lesson-4.1','lo-4.1.1','tf',null,true),
  ('tf-04-02','lesson-4.1','lo-4.1.2','tf',null,false),
  ('mcq-04-03','lesson-4.2','lo-4.2.2','mcq','B',null)
on conflict (question_id) do update set
  lesson_id = excluded.lesson_id,
  objective_id = excluded.objective_id,
  kind = excluded.kind,
  correct_mcq = excluded.correct_mcq,
  correct_tf = excluded.correct_tf;
