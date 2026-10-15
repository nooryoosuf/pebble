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
import { supabase, isSupabaseConfigured } from "./supabase";
import {
  fetchLearnerState,
  fetchProfile,
  fetchChildren,
  createChildAccount,
  pushLearnerSnapshot,
} from "./backend";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Role = "student" | "parent";
export type AuthStatus = "unconfigured" | "loading" | "signed-out" | "ready";
export type SyncMode = "saved" | "saving" | "offline";

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

export interface LinkedStudent {
  id: string;
  displayName: string;
}

interface StoreCtx {
  // auth — one account per family member; RLS keeps families apart
  authStatus: AuthStatus;
  authError: string | null;
  userId: string | null;
  accountRole: Role | null;
  accountName: string;
  students: LinkedStudent[];
  activeStudentId: string | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  canLearn: boolean;
  signUp: (input: { displayName: string; email: string; password: string; role: Role }) => Promise<boolean>;
  signIn: (input: { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  addChild: (input: { displayName: string; email: string; password: string }) => Promise<string | null>;
  switchStudent: (id: string) => void;
  retrySync: () => void;
  sync: { mode: SyncMode };
  // active learner snapshot (self for students, selected child for parents)
  progress: ProgressState;
  recordAttempt: (a: Omit<Attempt, "id" | "dateISO" | "scorePercent" | "autoCorrect" | "autoTotal" | "xpEarned" | "band"> & { dateISO?: string }) => Attempt;
  markFlashcardsSeen: (lesson: Lesson) => void;
  completeChallenge: () => void;
  /** Badge ids earned since the last celebration was dismissed (reward popup queue). */
  celebration: string[];
  advanceCelebration: () => void;
  dismissCelebration: () => void;
  setGoal: (lessonsPerWeek: number) => void;
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

const cacheKey = (studentId: string) => `pebble-cache-${studentId}`;

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

function readCache(studentId: string): ProgressState | null {
  try {
    const raw = localStorage.getItem(cacheKey(studentId));
    if (!raw) return null;
    return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function writeCache(studentId: string, p: ProgressState) {
  try {
    localStorage.setItem(cacheKey(studentId), JSON.stringify(p));
  } catch {
    /* storage unavailable */
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
  const [authStatus, setAuthStatus] = useState<AuthStatus>(isSupabaseConfigured ? "loading" : "unconfigured");
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [accountRole, setAccountRole] = useState<Role | null>(null);
  const [accountName, setAccountName] = useState("");
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(emptyProgress);
  const [syncMode, setSyncMode] = useState<SyncMode>("saved");
  const [dirty, setDirty] = useState(0);
  const [celebration, setCelebration] = useState<string[]>([]);
  const prevBadges = useRef<string[]>([]);

  const progressRef = useRef(progress);
  progressRef.current = progress;
  const activeRef = useRef<string | null>(null);
  activeRef.current = activeStudentId;
  const userRef = useRef<string | null>(null);
  userRef.current = userId;
  const roleRef = useRef<Role | null>(null);
  roleRef.current = accountRole;

  const canWriteAsLearner = useCallback(
    () => roleRef.current === "student" && !!userRef.current && activeRef.current === userRef.current,
    [],
  );

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

  // ── load a learner snapshot: server first, offline cache as fallback ──
  const loadSnapshot = useCallback(async (studentId: string) => {
    setSyncMode("saving");
    try {
      const remote = await fetchLearnerState(studentId);
      const rebuilt: ProgressState = {
        ...emptyProgress(),
        userName: remote.displayName,
        xp: remote.xp,
        studyDates: remote.days,
        completedLessons: [
          ...new Set(
            remote.attempts.filter((a) => a.band !== "revision").map((a) => a.lessonId),
          ).values(),
        ].filter((id) => id !== masterLesson.lessonId),
        attempts: remote.attempts,
        objectiveMastery: remote.mastery,
        earnedBadges: remote.badges,
        goals: { lessonsPerWeek: remote.goal },
        challengeDays: remote.challengeDays,
      };
      // recompute streak from study days (robust to clock skew)
      let run = 0;
      let cursor = new Date().toISOString().slice(0, 10);
      const set = new Set(rebuilt.studyDates);
      if (!set.has(cursor)) {
        cursor = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      }
      while (set.has(cursor)) {
        run += 1;
        cursor = new Date(new Date(cursor + "T12:00:00").getTime() - 86400000).toISOString().slice(0, 10);
      }
      rebuilt.streakDays = run;
      rebuilt.lastStudyDate = [...rebuilt.studyDates].sort().pop() ?? null;
      setProgress(rebuilt);
      writeCache(studentId, rebuilt);
      setSyncMode("saved");
    } catch {
      const cached = readCache(studentId);
      if (cached) {
        setProgress(cached);
        setSyncMode("offline");
      } else {
        setProgress(emptyProgress());
        setSyncMode("offline");
      }
    }
  }, []);

  const loadUser = useCallback(
    async (uid: string) => {
      // profile may lag the trigger by a beat — retry briefly
      let profile: { role: Role; displayName: string } | null = null;
      for (let i = 0; i < 4 && !profile; i++) {
        try {
          profile = await fetchProfile(uid);
        } catch {
          profile = null;
        }
        if (!profile && i < 3) await new Promise((r) => setTimeout(r, 800));
      }
      if (!profile) {
        setAuthError("Signed in, but the profile isn't ready yet — please retry in a moment.");
        setAuthStatus("signed-out");
        return;
      }
      setUserId(uid);
      setAccountRole(profile.role);
      setAccountName(profile.displayName);
      setAuthError(null);
      try {
        const { data: adminRow } = await supabase!
          .from("admins")
          .select("user_id")
          .eq("user_id", uid)
          .maybeSingle();
        setIsAdmin(!!adminRow);
      } catch {
        setIsAdmin(false);
      }
      if (profile.role === "student") {
        setStudents([]);
        setActiveStudentId(uid);
        await loadSnapshot(uid);
      } else {
        try {
          const kids = await fetchChildren(uid);
          setStudents(kids);
          if (kids.length > 0) {
            setActiveStudentId(kids[0].id);
            await loadSnapshot(kids[0].id);
          } else {
            setActiveStudentId(null);
            setProgress(emptyProgress());
          }
        } catch {
          setAuthError("Could not load your linked children — check your connection and retry.");
        }
      }
      setAuthStatus("ready");
    },
    [loadSnapshot],
  );

  // ── session bootstrap ──
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthStatus("unconfigured");
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      if (data.session?.user) void loadUser(data.session.user.id);
      else setAuthStatus("signed-out");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      if (event === "SIGNED_IN" && session?.user) void loadUser(session.user.id);
      else if (event === "SIGNED_OUT") {
        setUserId(null);
        setAccountRole(null);
        setAccountName("");
        setIsAdmin(false);
        setStudents([]);
        setActiveStudentId(null);
        setProgress(emptyProgress());
        setAuthStatus("signed-out");
      }
    });
    const onOnline = () => setDirty((d) => d + 1);
    window.addEventListener("online", onOnline);
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("online", onOnline);
    };
  }, [loadUser]);

  // ── persist active snapshot (idempotent full-state sync, retry-safe) ──
  useEffect(() => {
    if (dirty === 0) return;
    const sid = activeRef.current;
    const uid = userRef.current;
    if (!sid || !uid || !isSupabaseConfigured) return;
    let cancelled = false;
    setSyncMode("saving");
    const p = progressRef.current;
    void pushLearnerSnapshot(sid, {
      attempts: p.attempts,
      mastery: p.objectiveMastery,
      badges: p.earnedBadges,
      days: p.studyDates,
      challengeDays: p.challengeDays,
      xp: p.xp,
      goal: p.goals.lessonsPerWeek,
    }).then((ok) => {
      if (cancelled) return;
      if (ok) {
        writeCache(sid, progressRef.current);
        setSyncMode("saved");
      } else {
        setSyncMode("offline");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dirty]);

  const signUp = useCallback(
    async (input: { displayName: string; email: string; password: string; role: Role }) => {
      setAuthError(null);
      if (!isSupabaseConfigured || !supabase) {
        setAuthError("Backend is not connected yet — ask whoever set up Pebble to add the Supabase keys.");
        return false;
      }
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: { data: { display_name: input.displayName.trim(), role: input.role } },
      });
      if (error) {
        setAuthError(error.message);
        return false;
      }
      if (data.session?.user) {
        await loadUser(data.session.user.id);
        return true;
      }
      setAuthError("Account created — check your email to confirm it, then sign in.");
      return false;
    },
    [loadUser],
  );

  const signIn = useCallback(
    async (input: { email: string; password: string }) => {
      setAuthError(null);
      if (!isSupabaseConfigured || !supabase) {
        setAuthError("Backend is not connected yet — ask whoever set up Pebble to add the Supabase keys.");
        return false;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email.trim(),
        password: input.password,
      });
      if (error) {
        setAuthError(error.message);
        return false;
      }
      if (data.user) {
        setAuthStatus("loading");
        await loadUser(data.user.id);
        return true;
      }
      return false;
    },
    [loadUser],
  );

  const signOut = useCallback(async () => {
    try {
      await supabase?.auth.signOut();
    } finally {
      setUserId(null);
      setAccountRole(null);
      setAccountName("");
      setIsAdmin(false);
      setStudents([]);
      setActiveStudentId(null);
      setProgress(emptyProgress());
      setAuthStatus(isSupabaseConfigured ? "signed-out" : "unconfigured");
    }
  }, []);

  const addChild = useCallback(
    async (input: { displayName: string; email: string; password: string }): Promise<string | null> => {
      try {
        await createChildAccount(input);
      } catch (e) {
        return e instanceof Error ? e.message : "Could not create the student login";
      }
      try {
        if (userRef.current) {
          const kids = await fetchChildren(userRef.current);
          setStudents(kids);
          if (!activeRef.current && kids.length > 0) {
            setActiveStudentId(kids[0].id);
            await loadSnapshot(kids[0].id);
          }
        }
      } catch {
        /* list refreshes on next load */
      }
      return null;
    },
    [loadSnapshot],
  );

  const switchStudent = useCallback(
    (id: string) => {
      setActiveStudentId(id);
      void loadSnapshot(id);
    },
    [loadSnapshot],
  );

  const retrySync = useCallback(() => setDirty((d) => d + 1), []);

  const setGoal = useCallback((lessonsPerWeek: number) => {
    setProgress((p) => ({ ...p, goals: { lessonsPerWeek: Math.max(1, Math.min(12, lessonsPerWeek)) } }));
    setDirty((d) => d + 1);
  }, []);

  const markFlashcardsSeen = useCallback((lesson: Lesson) => {
    setProgress((p) => {
      const seen = { ...p.flashcardsSeen };
      for (const f of lesson.flashcards) seen[f.id] = true;
      return { ...p, flashcardsSeen: seen };
    });
  }, []);

  const completeChallenge = useCallback(() => {
    if (!canWriteAsLearner()) throw new Error("Only the student's own account records challenge completions.");
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
    setDirty((d) => d + 1);
  }, []);

  const recordAttempt = useCallback(
    (input: Omit<Attempt, "id" | "dateISO" | "scorePercent" | "autoCorrect" | "autoTotal" | "xpEarned" | "band"> & { dateISO?: string }) => {
      if (!canWriteAsLearner()) throw new Error("Only the student's own account records lessons.");
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
          if (b.badgeId === "bdg-capstone") {
            if (attempts.some((a) => a.lessonId === masterLesson.lessonId && a.scorePercent >= 80)) {
              award(b.badgeId, b.xpReward);
            }
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

        return { ...p, xp, streakDays, lastStudyDate, studyDates, completedLessons, attempts, objectiveMastery, earnedBadges };
      });
      setDirty((d) => d + 1);

      return created;
    },
    [],
  );

  const value = useMemo<StoreCtx>(() => {
    // today's lesson = first incomplete in curriculum order; the capstone
    // becomes today's mission once all 12 topic lessons are complete.
    const done = progress.completedLessons;
    const masterDone = isMasterComplete(progress.attempts);
    const todayLesson =
      lessons.find((l) => !done.includes(l.lessonId)) ??
      (!masterDone && isMasterUnlocked(done) ? masterLesson : lessons[lessons.length - 1]);

    // adaptive revision: weakest objectives → their lessons
    const weak = Object.entries(progress.objectiveMastery)
      .filter(([, e]) => !e.mastered)
      .sort((a, b) => a[1].bestScore - b[1].bestScore)
      .slice(0, 3);
    const recommendedRevision = weak.flatMap(([oid, e]) => {
      const lesson = lessons.find((l) => l.mcqs.some((q) => q.objectiveId === oid) || l.trueFalse.some((q) => q.objectiveId === oid));
      return lesson ? [{ lessonId: lesson.lessonId, reason: `Needs work (${e.bestScore}% best so far)` }] : [];
    });

    // weekly revision challenge: sample 1 MCQ from up to 6 lessons with MCQs
    const pool = lessons.filter((l) => l.mcqs.length > 0);
    const weeklyRevisionSet = pool.slice(0, 6).map((l) => ({ lessonId: l.lessonId, mcqId: l.mcqs[0].id }));

    return {
      authStatus,
      authError,
      userId,
      accountRole,
      accountName,
      students,
      activeStudentId,
      isAdmin,
      isLoggedIn: authStatus === "ready" && !!userId,
      canLearn: accountRole === "student" && !!userId && activeStudentId === userId,
      signUp,
      signIn,
      signOut,
      addChild,
      switchStudent,
      retrySync,
      sync: { mode: syncMode },
      progress,
      recordAttempt,
      markFlashcardsSeen,
      completeChallenge,
      celebration,
      advanceCelebration,
      dismissCelebration,
      setGoal,
      todayLesson,
      recommendedRevision,
      weeklyRevisionSet,
    };
  }, [authStatus, authError, userId, accountRole, accountName, students, activeStudentId, isAdmin, syncMode, progress, signUp, signIn, signOut, addChild, switchStudent, retrySync, recordAttempt, markFlashcardsSeen, completeChallenge, celebration, advanceCelebration, dismissCelebration, setGoal]);

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
