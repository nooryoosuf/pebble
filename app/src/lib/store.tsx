import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  autoMarkableCount,
  chapters,
  consistencyBadges,
  isMasterComplete,
  isMasterUnlocked,
  lessons,
  masterLesson,
  milestones,
  specialBadges,
  type Lesson,
} from "../data/curriculum";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Role = "student" | "parent";

export interface Attempt {
  id: string;
  lessonId: string;
  dateISO: string; // start time
  mcqAnswers: Record<string, string>;
  tfAnswers: Record<string, boolean>;
  shortAnswerSelfMarks: Record<string, number>; // rubric marks claimed per sa id
  challengeDone: boolean;
  scorePercent: number; // auto-marked portion only (server-authoritative in prod)
  autoCorrect: number;
  autoTotal: number;
  xpEarned: number;
  band: "progress" | "practice" | "revision";
  durationSeconds?: number;
}

export interface ObjectiveEvidence {
  attempts: number;
  bestScore: number; // best auto % on questions tagged to this objective
  mastered: boolean;
}

export interface ProgressState {
  userName: string;
  role: Role;
  xp: number;
  streakDays: number;
  lastStudyDate: string | null; // yyyy-mm-dd
  studyDates: string[]; // yyyy-mm-dd list
  completedLessons: string[]; // lessonIds with band progress/practice
  attempts: Attempt[];
  objectiveMastery: Record<string, ObjectiveEvidence>;
  earnedBadges: string[]; // badge/milestone ids
  goals: { lessonsPerWeek: number };
  flashcardsSeen: Record<string, boolean>;
  challengeDays: string[]; // yyyy-mm-dd weekly-showdown completions
}

interface StoreCtx {
  progress: ProgressState;
  demoMode: boolean;
  login: (name: string, role: Role) => void;
  logout: () => void;
  isLoggedIn: boolean;
  recordAttempt: (a: Omit<Attempt, "id" | "dateISO" | "scorePercent" | "autoCorrect" | "autoTotal" | "xpEarned" | "band"> & { dateISO?: string }) => Attempt;
  markFlashcardsSeen: (lesson: Lesson) => void;
  completeChallenge: () => void;
  /** Badge ids earned since the last celebration was dismissed (reward popup queue). */
  celebration: string[];
  advanceCelebration: () => void;
  dismissCelebration: () => void;
  setGoal: (lessonsPerWeek: number) => void;
  resetDemo: () => void;
  todayLesson: Lesson;
  recommendedRevision: { lessonId: string; reason: string }[];
  weeklyRevisionSet: { lessonId: string; mcqId: string }[];
}

// ─── Scoring (mirrors server logic; see supabase migration for RLS version) ──

export function bandFor(score: number): Attempt["band"] {
  if (score >= 80) return "progress";
  if (score >= 50) return "practice";
  return "revision";
}

/** Authoritative scorer: computed from correct answers, never trusted from client input. */
export function scoreLesson(
  lesson: Lesson,
  mcqAnswers: Record<string, string>,
  tfAnswers: Record<string, boolean>,
): { correct: number; total: number; percent: number } {
  let correct = 0;
  let total = 0;
  for (const q of lesson.mcqs) {
    total += 1;
    if ((mcqAnswers[q.id] ?? "").toUpperCase() === q.correctAnswer) correct += 1;
  }
  for (const q of lesson.trueFalse) {
    total += 1;
    if (tfAnswers[q.id] !== undefined && tfAnswers[q.id] === q.correctAnswer) correct += 1;
  }
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percent };
}

function xpFor(percent: number, band: Attempt["band"], isFirstCompletion: boolean): number {
  const base = 20;
  const perf = Math.round((percent / 100) * 60);
  const firstBonus = isFirstCompletion ? 20 : 5;
  const bandBonus = band === "progress" ? 20 : band === "practice" ? 10 : 0;
  return base + perf + firstBonus + bandBonus;
}

const STORAGE_KEY = "pebble-progress-v1";

function emptyProgress(): ProgressState {
  return {
    userName: "",
    role: "student",
    xp: 0,
    streakDays: 0,
    lastStudyDate: null,
    studyDates: [],
    completedLessons: [],
    attempts: [],
    objectiveMastery: {},
    earnedBadges: [],
    goals: { lessonsPerWeek: 5 },
    flashcardsSeen: {},
    challengeDays: [],
  };
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch {
    return emptyProgress();
  }
}

// ─── Mastery policy ──────────────────────────────────────────────────────────
// Mastery ≠ XP. An objective is mastered only with repeated strong evidence:
// best auto-marked score ≥ 80% across ≥ 2 attempts on that objective, OR a
// single 100% attempt with ≥ 3 tagged questions. Clicking through or farming
// easy questions cannot satisfy this.

function objectivesTouched(lesson: Lesson): string[] {
  const ids = new Set<string>();
  for (const q of lesson.mcqs) ids.add(q.objectiveId);
  for (const q of lesson.trueFalse) ids.add(q.objectiveId);
  return [...ids];
}

function perObjectiveScore(
  lesson: Lesson,
  objectiveId: string,
  mcqAnswers: Record<string, string>,
  tfAnswers: Record<string, boolean>,
): { correct: number; total: number } {
  let correct = 0;
  let total = 0;
  for (const q of lesson.mcqs.filter((q) => q.objectiveId === objectiveId)) {
    total += 1;
    if ((mcqAnswers[q.id] ?? "").toUpperCase() === q.correctAnswer) correct += 1;
  }
  for (const q of lesson.trueFalse.filter((q) => q.objectiveId === objectiveId)) {
    total += 1;
    if (tfAnswers[q.id] !== undefined && tfAnswers[q.id] === q.correctAnswer) correct += 1;
  }
  return { correct, total };
}

const Ctx = createContext<StoreCtx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(load);
  const [celebration, setCelebration] = useState<string[]>([]);
  const prevBadges = useRef<string[]>(progress.earnedBadges);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable */
    }
  }, [progress]);

  // Queue freshly earned badges for the celebration popup (once each).
  useEffect(() => {
    const fresh = progress.earnedBadges.filter((b) => !prevBadges.current.includes(b));
    prevBadges.current = progress.earnedBadges;
    if (fresh.length > 0) {
      setCelebration((q) => [...q, ...fresh.filter((b) => !q.includes(b))]);
    }
  }, [progress.earnedBadges]);

  const advanceCelebration = useCallback(() => {
    setCelebration((q) => q.slice(1));
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebration([]);
  }, []);

  const login = useCallback((name: string, role: Role) => {
    setProgress((p) => ({ ...p, userName: name.trim() || (role === "parent" ? "Parent" : "Learner"), role }));
  }, []);

  const logout = useCallback(() => {
    setProgress((p) => ({ ...p, userName: "" }));
  }, []);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(emptyProgress());
  }, []);

  const setGoal = useCallback((lessonsPerWeek: number) => {
    setProgress((p) => ({ ...p, goals: { lessonsPerWeek: Math.max(1, Math.min(12, lessonsPerWeek)) } }));
  }, []);

  const markFlashcardsSeen = useCallback((lesson: Lesson) => {
    setProgress((p) => {
      const seen = { ...p.flashcardsSeen };
      for (const f of lesson.flashcards) seen[f.id] = true;
      return { ...p, flashcardsSeen: seen };
    });
  }, []);

  const completeChallenge = useCallback(() => {
    const day = new Date().toISOString().slice(0, 10);
    setProgress((p) => {
      if (p.challengeDays.includes(day)) return p;
      const already = p.earnedBadges.includes("bdg-reviser");
      return {
        ...p,
        challengeDays: [...p.challengeDays, day],
        earnedBadges: already ? p.earnedBadges : [...p.earnedBadges, "bdg-reviser"],
        xp: already ? p.xp : p.xp + consistencyBadges[3].xpReward,
      };
    });
  }, []);

  const recordAttempt = useCallback(
    (input: Omit<Attempt, "id" | "dateISO" | "scorePercent" | "autoCorrect" | "autoTotal" | "xpEarned" | "band"> & { dateISO?: string }) => {
      const lesson = lessons.find((l) => l.lessonId === input.lessonId) ?? (input.lessonId === masterLesson.lessonId ? masterLesson : undefined);
      if (!lesson) throw new Error(`Unknown lesson: ${input.lessonId}`);
      const { correct, total, percent } = scoreLesson(lesson, input.mcqAnswers, input.tfAnswers);
      const band = bandFor(percent);

      let created: Attempt = {
        id: `att-${Date.now()}-${Math.floor(Math.random() * 1e5)}`,
        dateISO: input.dateISO ?? new Date().toISOString(),
        lessonId: input.lessonId,
        mcqAnswers: input.mcqAnswers,
        tfAnswers: input.tfAnswers,
        shortAnswerSelfMarks: input.shortAnswerSelfMarks,
        challengeDone: input.challengeDone,
        scorePercent: percent,
        autoCorrect: correct,
        autoTotal: total,
        xpEarned: 0,
        band,
        durationSeconds: input.durationSeconds,
      };

      setProgress((p) => {
        const isFirstCompletion = !p.completedLessons.includes(input.lessonId);
        const xpEarned = xpFor(percent, band, isFirstCompletion);
        created = { ...created, xpEarned };

        // streak / consistency
        const day = created.dateISO.slice(0, 10);
        const studyDates = p.studyDates.includes(day) ? p.studyDates : [...p.studyDates, day];
        let streakDays = p.streakDays;
        let lastStudyDate = p.lastStudyDate;
        if (lastStudyDate !== day) {
          const yesterday = new Date(new Date(day + "T12:00:00").getTime() - 86400000).toISOString().slice(0, 10);
          streakDays = lastStudyDate === yesterday ? p.streakDays + 1 : p.streakDays === 0 ? 1 : (p.studyDates.includes(yesterday) ? p.streakDays + 1 : 1);
          // simpler robust rule: recompute consecutive run ending today
          let run = 0;
          let cursor = day;
          const set = new Set(studyDates);
          while (set.has(cursor)) {
            run += 1;
            cursor = new Date(new Date(cursor + "T12:00:00").getTime() - 86400000).toISOString().slice(0, 10);
          }
          streakDays = run;
          lastStudyDate = day;
        }

        const completedLessons =
          band !== "revision" && !p.completedLessons.includes(input.lessonId)
            ? [...p.completedLessons, input.lessonId]
            : p.completedLessons;

        // objective evidence + mastery
        const objectiveMastery = { ...p.objectiveMastery };
        for (const oid of objectivesTouched(lesson)) {
          const s = perObjectiveScore(lesson, oid, input.mcqAnswers, input.tfAnswers);
          const pct = s.total === 0 ? 0 : Math.round((s.correct / s.total) * 100);
          const prev = objectiveMastery[oid] ?? { attempts: 0, bestScore: 0, mastered: false };
          const attempts = prev.attempts + 1;
          const bestScore = Math.max(prev.bestScore, pct);
          // count tagged questions across the whole curriculum attempt history roughly:
          // mastered if (attempts>=2 && best>=80) or (single attempt with >=3 tagged Qs at 100%)
          const taggedTotal = s.total;
          const mastered = prev.mastered || (attempts >= 2 && bestScore >= 80) || (taggedTotal >= 3 && pct === 100);
          objectiveMastery[oid] = { attempts, bestScore, mastered };
        }

        const attempts = [...p.attempts, created];
        let xp = p.xp + xpEarned;
        const earnedBadges = [...p.earnedBadges];

        const award = (id: string, bonus: number) => {
          if (!earnedBadges.includes(id)) {
            earnedBadges.push(id);
            xp += bonus;
          }
        };

        // milestone check: all lessons in chapter completed (band progress/practice)
        for (const m of milestones) {
          const chLessons = lessons.filter((l) => l.chapterId === m.chapterId).map((l) => l.lessonId);
          if (chLessons.every((id) => [...completedLessons].includes(id))) award(m.milestoneId, m.xpReward);
        }
        for (const b of specialBadges) {
          if (b.badgeId === "bdg-flawless-balance") {
            const rel = attempts.filter((a) => ["lesson-2.1", "lesson-2.2", "lesson-2.3"].includes(a.lessonId));
            if (rel.some((a) => a.scorePercent === 100)) award(b.badgeId, b.xpReward);
          }
          if (b.badgeId === "bdg-productivity-pro") {
            const rel = attempts.filter((a) => a.lessonId === "lesson-3.4");
            if (rel.some((a) => a.scorePercent === 100)) award(b.badgeId, b.xpReward);
          }
          if (b.badgeId === "bdg-island-economist") {
            const rel = attempts.filter((a) => ["lesson-1.1", "lesson-1.2"].includes(a.lessonId));
            if (rel.some((a) => a.scorePercent === 100)) award(b.badgeId, b.xpReward);
          }
          if (b.badgeId === "bdg-corporate-architect") {
            const rel = attempts.filter((a) => a.lessonId === "lesson-4.1" && a.challengeDone && a.scorePercent >= 80);
            if (rel.length > 0) award(b.badgeId, b.xpReward);
          }
        }
        // consistency badges
        if (streakDays >= 3) award("bdg-streak-3", consistencyBadges[0].xpReward);
        if (streakDays >= 7) award("bdg-streak-7", consistencyBadges[1].xpReward);
        // comeback: any lesson where latest beats earliest by >=20
        for (const l of lessons) {
          const rel = attempts.filter((a) => a.lessonId === l.lessonId);
          if (rel.length >= 2 && rel[rel.length - 1].scorePercent - rel[0].scorePercent >= 20) {
            award("bdg-comeback", 80);
            break;
          }
        }
        // capstone: clearing the Final Showdown at 80%+ earns the top badge
        if (attempts.some((a) => a.lessonId === masterLesson.lessonId && a.scorePercent >= 80)) {
          const cap = specialBadges.find((b) => b.badgeId === "bdg-capstone");
          if (cap) award(cap.badgeId, cap.xpReward);
        }

        return { ...p, xp, streakDays, lastStudyDate, studyDates, completedLessons, attempts, objectiveMastery, earnedBadges };
      });

      return created;
    },
    [],
  );

  const value = useMemo<StoreCtx>(() => {
    // today's lesson = first incomplete in curriculum order; the capstone
    // becomes today's mission once all 12 topic lessons are complete.
    const masterDone = isMasterComplete(progress.attempts);
    const todayLesson =
      lessons.find((l) => !progress.completedLessons.includes(l.lessonId)) ??
      (!masterDone && isMasterUnlocked(progress.completedLessons) ? masterLesson : lessons[lessons.length - 1]);

    // adaptive revision: weakest objectives → their lessons
    const weak = Object.entries(progress.objectiveMastery)
      .filter(([, e]) => !e.mastered)
      .sort((a, b) => a[1].bestScore - b[1].bestScore)
      .slice(0, 3);
    const recommendedRevision = weak.flatMap(([oid, e]) => {
      const lesson = lessons.find((l) => l.mcqs.some((q) => q.objectiveId === oid) || l.trueFalse.some((q) => q.objectiveId === oid));
      return lesson ? [{ lessonId: lesson.lessonId, reason: `Needs work (${e.bestScore}% best so far)` }] : [];
    });

    // weekly revision challenge: sample 1 MCQ from up to 6 completed/weak lessons
    const pool = lessons.filter((l) => l.mcqs.length > 0);
    const weeklyRevisionSet = pool.slice(0, 6).map((l) => ({ lessonId: l.lessonId, mcqId: l.mcqs[0].id }));

    return {
      progress,
      demoMode: true,
      login,
      logout,
      isLoggedIn: progress.userName.length > 0,
      recordAttempt,
      markFlashcardsSeen,
      completeChallenge,
      celebration,
      advanceCelebration,
      dismissCelebration,
      setGoal,
      resetDemo,
      todayLesson,
      recommendedRevision,
      weeklyRevisionSet,
    };
  }, [progress, login, logout, recordAttempt, markFlashcardsSeen, completeChallenge, celebration, advanceCelebration, dismissCelebration, setGoal, resetDemo]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}

export function levelForXp(xp: number): { level: number; intoLevel: number; levelSize: number } {
  const levelSize = 300;
  const level = Math.floor(xp / levelSize) + 1;
  return { level, intoLevel: xp % levelSize, levelSize };
}

export { autoMarkableCount, chapters };
export type { Lesson };
