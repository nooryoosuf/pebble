-- Pebble · auto-purge learner rows on child profile delete (applies after 007)
-- Learner ids carry no FK (007), so deleting a child profile must also wipe
-- its learning rows — otherwise orphan rows would pollute admin stats.
-- (The app also wipes first; this trigger is the safety net for direct deletes.)

create or replace function public.purge_learner_rows() returns trigger as
$$
begin
  delete from public.challenge_results where student_id = old.id;
  delete from public.challenge_days where student_id = old.id;
  delete from public.earned_badges where student_id = old.id;
  delete from public.objective_mastery where student_id = old.id;
  delete from public.study_days where student_id = old.id;
  delete from public.attempts where student_id = old.id;
  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_purge_learner_rows on public.child_profiles;
create trigger trg_purge_learner_rows
  before delete on public.child_profiles
  for each row execute function public.purge_learner_rows();
