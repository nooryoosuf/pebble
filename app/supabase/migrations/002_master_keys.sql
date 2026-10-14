-- Pebble · Master Chapter (capstone) answer keys
-- Same pattern as 001: scores are computed by the grade_attempt trigger,
-- client-submitted scores are ignored.

insert into public.answer_keys (question_id, lesson_id, objective_id, kind, correct_mcq, correct_tf) values
  ('mcq-m-01','lesson-master','lo-1.1.1','mcq','B',null),
  ('mcq-m-02','lesson-master','lo-2.1.3','mcq','C',null),
  ('mcq-m-03','lesson-master','lo-3.3.1','mcq','B',null),
  ('mcq-m-04','lesson-master','lo-4.1.2','mcq','B',null),
  ('tf-m-01','lesson-master','lo-1.2.2','tf',null,false),
  ('tf-m-02','lesson-master','lo-2.2.1','tf',null,true),
  ('tf-m-03','lesson-master','lo-3.4.1','tf',null,false),
  ('tf-m-04','lesson-master','lo-4.2.2','tf',null,false)
on conflict (question_id) do update set
  lesson_id = excluded.lesson_id,
  objective_id = excluded.objective_id,
  kind = excluded.kind,
  correct_mcq = excluded.correct_mcq,
  correct_tf = excluded.correct_tf;
