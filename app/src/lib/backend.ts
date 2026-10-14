import { supabase, isSupabaseConfigured } from "./supabase";
import type { Attempt, ObjectiveEvidence } from "./store";

/* ─── Supabase persistence layer ─────────────────────────────────────────────
   Server is the source of truth; localStorage holds a per-student offline
   cache. Every write is idempotent (PK upserts / insert-if-missing) so failed
   syncs can simply retry later. Scores are recomputed by the grade_attempt
   trigger — the client inserts raw answers only.
----------------------------------------------------------------------------- */

export interface RemoteLearnerState {
  attempts: Attempt[];
  mastery: Record<string, ObjectiveEvidence>;
  badges: string[];
  days: string[];
  challengeDays: string[];
  xp: number;
  goal: number;
  displayName: string;
}

interface AttemptRow {
  id: string;
  lesson_id: string;
  mcq_answers: Record<string, string>;
  tf_answers: Record<string, boolean>;
  short_answer_self_marks: Record<string, number>;
  challenge_done: boolean;
  auto_correct: number;
  auto_total: number;
  score_percent: number;
  band: "progress" | "practice" | "revision";
  xp_earned: number;
  duration_seconds: number | null;
  created_at: string;
}

function rowToAttempt(r: AttemptRow): Attempt {
  return {
    id: r.id,
    lessonId: r.lesson_id,
    dateISO: r.created_at,
    mcqAnswers: r.mcq_answers ?? {},
    tfAnswers: r.tf_answers ?? {},
    shortAnswerSelfMarks: r.short_answer_self_marks ?? {},
    challengeDone: !!r.challenge_done,
    scorePercent: r.score_percent ?? 0,
    autoCorrect: r.auto_correct ?? 0,
    autoTotal: r.auto_total ?? 0,
    xpEarned: r.xp_earned ?? 0,
    band: (r.band as Attempt["band"]) ?? "revision",
    durationSeconds: r.duration_seconds ?? undefined,
  };
}

function attemptToRow(studentId: string, a: Attempt) {
  return {
    id: a.id,
    student_id: studentId,
    lesson_id: a.lessonId,
    mcq_answers: a.mcqAnswers,
    tf_answers: a.tfAnswers,
    short_answer_self_marks: a.shortAnswerSelfMarks,
    challenge_done: a.challengeDone,
    duration_seconds: a.durationSeconds ?? null,
    // Derived columns below are overwritten by grade_attempt; sent for shape only.
    auto_correct: a.autoCorrect,
    auto_total: a.autoTotal,
    score_percent: a.scorePercent,
    band: a.band,
    xp_earned: a.xpEarned,
  };
}

export function requireBackend() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Backend is not connected. Add Supabase keys (see README) and restart.");
  }
  return supabase;
}

export async function fetchLearnerState(studentId: string): Promise<RemoteLearnerState> {
  const db = requireBackend();
  const [att, mast, badges, days, chDays, prof] = await Promise.all([
    db.from("attempts").select("*").eq("student_id", studentId).order("created_at", { ascending: true }).limit(1000),
    db.from("objective_mastery").select("objective_id,attempts,best_score,mastered").eq("student_id", studentId),
    db.from("earned_badges").select("badge_id").eq("student_id", studentId),
    db.from("study_days").select("day").eq("student_id", studentId),
    db.from("challenge_days").select("day").eq("student_id", studentId),
    db.from("profiles").select("display_name,lessons_per_week,xp").eq("id", studentId).single(),
  ]);
  for (const r of [att, mast, badges, days, chDays, prof]) {
    if (r.error) throw r.error;
  }
  const mastery: Record<string, ObjectiveEvidence> = {};
  for (const m of mast.data ?? []) {
    mastery[m.objective_id] = { attempts: m.attempts, bestScore: m.best_score, mastered: !!m.mastered };
  }
  return {
    attempts: ((att.data ?? []) as AttemptRow[]).map(rowToAttempt),
    mastery,
    badges: (badges.data ?? []).map((b) => b.badge_id as string),
    days: (days.data ?? []).map((d) => d.day as string),
    challengeDays: (chDays.data ?? []).map((d) => d.day as string),
    xp: prof.data?.xp ?? 0,
    goal: prof.data?.lessons_per_week ?? 5,
    displayName: prof.data?.display_name ?? "Learner",
  };
}

export async function fetchProfile(userId: string): Promise<{ role: "student" | "parent"; displayName: string } | null> {
  const db = requireBackend();
  const { data, error } = await db.from("profiles").select("role,display_name").eq("id", userId).single();
  if (error) return null;
  return { role: data.role === "parent" ? "parent" : "student", displayName: data.display_name ?? "Learner" };
}

export async function fetchChildren(parentId: string): Promise<{ id: string; displayName: string }[]> {
  const db = requireBackend();
  const { data, error } = await db
    .from("parent_links")
    .select("student_id, profiles!parent_links_student_id_fkey(id,display_name)")
    .eq("parent_id", parentId);
  if (error) throw error;
  return (data ?? []).map((r) => {
    const p = r.profiles as unknown as { id: string; display_name: string } | null;
    return { id: p?.id ?? r.student_id, displayName: p?.display_name ?? "Learner" };
  });
}

export async function createChildAccount(input: { displayName: string; email: string; password: string }): Promise<{ studentId: string; email: string }> {
  const db = requireBackend();
  const { data, error } = await db.functions.invoke("create-student", { body: input });
  if (error) throw new Error(error.message || "Could not create the student login");
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as { studentId: string; email: string };
}

/** Persist a full learner snapshot. Idempotent (PK upserts) so failed syncs can retry. Returns true when everything landed. */
export async function pushLearnerSnapshot(
  studentId: string,
  s: {
    attempts: Attempt[];
    mastery: Record<string, ObjectiveEvidence>;
    badges: string[];
    days: string[];
    challengeDays: string[];
    xp: number;
    goal: number;
  },
): Promise<boolean> {
  const db = requireBackend();
  try {
    if (s.attempts.length > 0) {
      // ignoreDuplicates: first insert runs the grade_attempt trigger;
      // retries skip already-saved rows instead of erroring.
      const { error } = await db
        .from("attempts")
        .upsert(s.attempts.map((a) => attemptToRow(studentId, a)), {
          onConflict: "id",
          ignoreDuplicates: true,
        });
      if (error) throw error;
    }
    const mRows = Object.entries(s.mastery).map(([objective_id, e]) => ({
      student_id: studentId,
      objective_id,
      attempts: e.attempts,
      best_score: e.bestScore,
      mastered: e.mastered,
    }));
    if (mRows.length > 0) {
      const { error } = await db.from("objective_mastery").upsert(mRows, { onConflict: "student_id,objective_id" });
      if (error) throw error;
    }
    if (s.badges.length > 0) {
      const { error } = await db
        .from("earned_badges")
        .upsert(s.badges.map((badge_id) => ({ student_id: studentId, badge_id })), {
          onConflict: "student_id,badge_id",
          ignoreDuplicates: true,
        });
      if (error) throw error;
    }
    if (s.days.length > 0) {
      const { error } = await db
        .from("study_days")
        .upsert(s.days.map((day) => ({ student_id: studentId, day })), {
          onConflict: "student_id,day",
          ignoreDuplicates: true,
        });
      if (error) throw error;
    }
    if (s.challengeDays.length > 0) {
      const { error } = await db
        .from("challenge_days")
        .upsert(s.challengeDays.map((day) => ({ student_id: studentId, day })), {
          onConflict: "student_id,day",
          ignoreDuplicates: true,
        });
      if (error) throw error;
    }
    const { error: profErr } = await db
      .from("profiles")
      .update({ xp: s.xp, lessons_per_week: Math.max(1, Math.min(12, s.goal)) })
      .eq("id", studentId);
    if (profErr) throw profErr;
    return true;
  } catch {
    return false;
  }
}
