-- Pebble · multi-family auth hardening (applies after 001 + 002)
--
-- 1. Profiles get an XP wallet (client-computed, family-grade trust).
-- 2. New auth users automatically get a profile; role comes from the signup
--    metadata and can never be changed by a client (prevents a student from
--    promoting themselves to parent).
-- 3. Only verified parents can create parent↔student links, and parents may
--    update (but never re-role) their linked children's profiles (goals, name).

-- ── 1. XP wallet ─────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists xp int not null default 0;

-- ── 2. Auto-profile on signup ────────────────────────────────────────────────
create or replace function public.handle_new_user() returns trigger as $$
declare
  wanted_role text := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'student');
  wanted_name text := coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1));
begin
  if wanted_role not in ('student', 'parent') then
    wanted_role := 'student';
  end if;
  insert into public.profiles (id, display_name, role)
  values (new.id, wanted_name, wanted_role)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 3. Lock the role column against client writes ────────────────────────────
create or replace function public.lock_profile_role() returns trigger as $$
begin
  if old.role is distinct from new.role
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'profile role is managed by the system';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_lock_profile_role on public.profiles;
create trigger trg_lock_profile_role
  before update on public.profiles
  for each row execute function public.lock_profile_role();

-- ── 4. Verified-parent link creation ─────────────────────────────────────────
drop policy if exists "parent creates link" on public.parent_links;
create policy "verified parent creates link" on public.parent_links
  for insert with check (
    auth.uid() = parent_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'parent'
    )
  );

-- ── 5. Parents may update their linked children's profiles ───────────────────
-- (weekly goals, display name). Role cannot change (trigger above + check).
drop policy if exists "parent updates linked student" on public.profiles;
create policy "parent updates linked student" on public.profiles
  for update using (
    exists (
      select 1 from public.parent_links pl
      where pl.parent_id = auth.uid() and pl.student_id = profiles.id
    )
  )
  with check (
    role = 'student'
    and exists (
      select 1 from public.parent_links pl
      where pl.parent_id = auth.uid() and pl.student_id = profiles.id
    )
  );
