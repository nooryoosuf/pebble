import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  Target,
  TriangleAlert,
  CircleCheck,
  UserPlus,
  Loader2,
  Flame,
  Zap,
  Map as MapIcon,
  CalendarDays,
} from "lucide-react";
import { Button, Card, Badge, ProgressBar } from "../components/ui";
import ParentReport from "../components/ParentReport";
import { EmptyArt } from "../components/art";
import { AppIcon } from "../components/PebbleMascot";
import { lessons, chapters, chapterById, masterLesson } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { cn } from "../components/ui";

/** Parent-only: switch between children + add password-free profiles. */
function ChildManager() {
  const { students, activeStudentId, switchStudent, addChildProfile, deleteChildProfile } = useProgress();
  const [showForm, setShowForm] = useState(students.length === 0);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const valid = name.trim().length >= 2;

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    const err = await addChildProfile(name);
    setBusy(false);
    if (err) {
      setMsg({ ok: false, text: err });
    } else {
      setMsg({ ok: true, text: `${name.trim()} joined the family — pick their profile above to begin.` });
      setName("");
    }
  };

  const remove = async (id: string, displayName: string) => {
    setBusy(true);
    const err = await deleteChildProfile(id);
    setBusy(false);
    setConfirmDelete(null);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: `${displayName}'s profile and learning data were deleted.` });
  };

  return (
    <Card>
      <p className="text-[11px] font-extrabold tracking-[0.14em] text-slate-muted uppercase">Your children</p>
      {students.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Choose child">
          {students.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={activeStudentId === s.id}
              onClick={() => switchStudent(s.id, s.kind)}
              className={cn(
                "cursor-pointer rounded-2xl border-2 px-3.5 py-2 text-sm font-black transition",
                activeStudentId === s.id
                  ? "border-sky-500 bg-sky-100 text-sky-700"
                  : "border-line bg-white text-slate-muted hover:text-slate-ink",
              )}
            >
              {s.displayName}
              {s.kind === "account" && <span className="ml-1.5 text-[10px] font-black uppercase opacity-60">login</span>}
            </button>
          ))}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex cursor-pointer items-center gap-1 rounded-2xl border-2 border-dashed border-line px-3.5 py-2 text-sm font-black text-slate-muted hover:text-slate-ink"
          >
            <UserPlus size={15} strokeWidth={2.75} /> Add child
          </button>
        </div>
      )}
      {(showForm || students.length === 0) && (
        <div className="mt-3 rounded-2xl border border-line bg-stage/60 p-3.5">
          <p className="text-sm font-black">Add a child's profile</p>
          <p className="text-xs font-semibold text-slate-muted">
            Just a name — no email or password needed. They learn right here, under your sign-in.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Child's first name" autoComplete="off"
              onKeyDown={(e) => { if (e.key === "Enter" && valid && !busy) void submit(); }}
              className="min-w-44 flex-1 rounded-xl border-2 border-line bg-white px-3 py-2 text-sm font-bold outline-none placeholder:text-faint focus:border-sky-400" />
            <Button variant="blue" className="px-4 py-2 text-sm" disabled={!valid || busy} onClick={submit}>
              {busy ? <Loader2 size={15} strokeWidth={3} className="animate-spin" /> : <UserPlus size={15} strokeWidth={2.75} />}
              Add profile
            </Button>
          </div>
          {msg && (
            <p className={cn("mt-2 rounded-xl border-2 px-3 py-2 text-xs font-bold", msg.ok ? "border-mint-400/50 bg-mint-50 text-mint-800" : "border-coral-400/50 bg-coral-100/50 text-coral-700")} role="alert">
              {msg.text}
            </p>
          )}
          {students.filter((s) => s.kind === "profile").length > 0 && (
            <div className="mt-2 border-t border-line pt-2">
              <p className="text-[11px] font-black tracking-wider text-slate-muted uppercase">Remove a profile</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {students.filter((s) => s.kind === "profile").map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-bold">
                    {s.displayName}
                    {confirmDelete === s.id ? (
                      <>
                        <button onClick={() => void remove(s.id, s.displayName)} className="cursor-pointer font-black text-coral-700 underline">confirm?</button>
                        <button onClick={() => setConfirmDelete(null)} className="cursor-pointer text-slate-muted underline">keep</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(s.id)} className="cursor-pointer text-slate-muted underline hover:text-coral-700">remove</button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function Parent() {
  const { progress, isLoggedIn, setGoal, accountRole, accountName, students, activeStudentId, sync, demoMode } = useProgress();
  const [goalDraft, setGoalDraft] = useState(progress.goals.lessonsPerWeek);

  // keep the goal editor in sync when switching children
  useEffect(() => {
    setGoalDraft(progress.goals.lessonsPerWeek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudentId]);

  const attempts = progress.attempts;
  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.scorePercent, 0) / attempts.length) : null;
  const last7 = attempts.filter((a) => Date.now() - new Date(a.dateISO).getTime() < 7 * 86400000);

  const chapterStats = chapters.map((c) => {
    const chLessons = lessons.filter((l) => l.chapterId === c.chapterId);
    const chAttempts = attempts.filter((a) => chLessons.some((l) => l.lessonId === a.lessonId));
    const chAvg = chAttempts.length ? Math.round(chAttempts.reduce((s, a) => s + a.scorePercent, 0) / chAttempts.length) : null;
    const done = chLessons.filter((l) => progress.completedLessons.includes(l.lessonId)).length;
    return { chapter: c, avg: chAvg, done, total: chLessons.length, count: chAttempts.length };
  });

  const weakObjectives = Object.entries(progress.objectiveMastery)
    .filter(([, e]) => !e.mastered)
    .sort((a, b) => a[1].bestScore - b[1].bestScore)
    .slice(0, 5);
  const strongObjectives = Object.entries(progress.objectiveMastery).filter(([, e]) => e.mastered);
  const trend = attempts.slice(-8);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <div className="flex justify-center"><AppIcon size={56} /></div>
          <p className="mt-2 text-lg font-black text-slate-ink">Parent reports</p>
          <p className="text-sm font-semibold text-slate-muted">Reports here are built only from recorded activity — never estimated.</p>
          <Link to="/start"><Button variant="blue" className="mt-4 w-full">Sign in to view reports</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-slate-ink">
      {/* restrained brand header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-line bg-white p-5">
        <div className="flex items-center gap-3">
          <AppIcon size={44} />
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-slate-muted uppercase">
              Parent dashboard · {accountName || "Family"}
            </p>
            <h1 className="text-2xl font-black">Learning report</h1>
            <p className="text-xs font-semibold text-slate-muted">
              {demoMode
                ? "Sample family preview — demo data, nothing is saved to an account."
                : sync.mode === "offline"
                  ? "You're offline — showing the last synced snapshot."
                  : "Synced from your child's saved account activity."}
            </p>
          </div>
        </div>
        <Badge tone="neutral" className="bg-white">
          <CalendarDays size={13} strokeWidth={2.75} /> {progress.studyDates.length} study days
        </Badge>
      </div>

      {accountRole === "parent" && (
        <div className="mt-3">
          <ChildManager />
        </div>
      )}

      {accountRole === "student" && !demoMode && (
        <Card className="mt-3 text-center">
          <p className="text-lg font-black">This corner is for parents</p>
          <p className="mx-auto max-w-md text-sm font-semibold text-slate-muted">
            Missions, streaks and medals live in your world. Ask a parent to create their own login to follow your progress here.
          </p>
          <Link to="/dashboard"><Button className="mt-3">Back to learning</Button></Link>
        </Card>
      )}

      {accountRole === "parent" && students.length === 0 && (
        <Card className="mt-3 text-center">
          <EmptyArt className="mx-auto h-28 w-auto" />
          <p className="mt-2 text-lg font-black">Add your child to begin</p>
          <p className="mx-auto max-w-md text-sm font-semibold text-slate-muted">
            Add their profile above — just a name, no login needed. Their lessons, scores and reports will land here, separate from every other family.
          </p>
        </Card>
      )}

      {/* In the demo tour, preview the sample family's report (no real children). */}
      {(demoMode || (accountRole === "parent" && students.length > 0)) && attempts.length === 0 ? (
        <Card className="mt-4 text-center">
          <EmptyArt className="mx-auto h-28 w-auto" />
          <p className="mt-2 text-lg font-black">No activity yet</p>
          <p className="mx-auto max-w-md text-sm font-semibold text-slate-muted">
            Once your child completes a lesson, scores, trends and strengths will appear here — based on real attempts only.
          </p>
        </Card>
      ) : null}
      {(demoMode || (accountRole === "parent" && students.length > 0)) && attempts.length > 0 ? (
        <div className="mt-4 space-y-3">
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: TrendingUp, label: "Average score", value: `${avg}%`, sub: `${attempts.length} attempts` },
              { icon: Flame, label: "Day streak", value: `${progress.streakDays}`, sub: "consecutive days" },
              { icon: MapIcon, label: "Lessons done", value: `${progress.completedLessons.length}/${lessons.length}`, sub: "curriculum" },
              { icon: Zap, label: "Total XP", value: `${progress.xp}`, sub: "all time" },
            ].map((k) => (
              <Card key={k.label} className="p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">
                  <k.icon size={13} strokeWidth={2.75} /> {k.label}
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums">{k.value}</p>
                <p className="text-xs font-semibold text-slate-muted">{k.sub}</p>
              </Card>
            ))}
          </div>

          <ParentReport />

          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">
                <TrendingUp size={14} strokeWidth={2.75} /> Performance trend
              </p>
              <div className="mt-3 flex h-24 items-end gap-1.5" role="img" aria-label={`Last ${trend.length} attempt scores`}>
                {trend.map((a) => (
                  <div key={a.id} className="flex flex-1 flex-col items-center gap-1" title={`${a.lessonId}: ${a.scorePercent}%`}>
                    <span className="text-[10px] font-extrabold tabular-nums text-slate-muted">{a.scorePercent}</span>
                    <div className="w-full rounded-t-md bg-sky-400" style={{ height: `${Math.max(10, (a.scorePercent / 100) * 72)}px` }} />
                  </div>
                ))}
              </div>
              <p className="mt-2 border-t border-line pt-2 text-xs font-semibold text-slate-muted">
                Last {trend.length} attempts · last 7 days: {last7.length} attempts
              </p>
            </Card>

            <Card>
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">
                <Target size={14} strokeWidth={2.75} /> Weekly goal
              </p>
              <p className="mt-2 text-sm font-bold">
                {progress.completedLessons.length} of {progress.goals.lessonsPerWeek} lessons this cycle
              </p>
              <ProgressBar value={Math.min(progress.goals.lessonsPerWeek, progress.completedLessons.length)} max={progress.goals.lessonsPerWeek} bar="bg-sky-400" className="mt-2" />
              <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
                <label htmlFor="goal-input" className="text-xs font-extrabold">Lessons / week:</label>
                <input
                  id="goal-input"
                  type="number" min={1} max={12} value={goalDraft}
                  onChange={(e) => setGoalDraft(Number(e.target.value))}
                  className="w-16 rounded-xl border-2 border-line px-2 py-1.5 text-sm font-extrabold tabular-nums"
                />
                <Button variant="blue" className="px-3 py-1.5 text-xs" onClick={() => setGoal(goalDraft)}>Save</Button>
              </div>
            </Card>
          </div>

          <Card>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">Chapter performance</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {chapterStats.map(({ chapter, avg: a, done, total, count }) => (
                <div key={chapter.chapterId} className="rounded-2xl border border-line bg-stage p-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-extrabold">{chapter.title}</p>
                    <p className="text-lg font-black tabular-nums">{a === null ? "—" : `${a}%`}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-muted">
                    pp. {chapter.pages.start}–{chapter.pages.end} · {done}/{total} lessons · {count} attempts
                  </p>
                  {a !== null ? (
                    <ProgressBar value={a} bar="bg-sky-400" className="mt-2 h-2.5" />
                  ) : (
                    <p className="mt-2 text-xs font-semibold text-slate-muted">Not attempted yet</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">
                <TriangleAlert size={14} strokeWidth={2.75} /> Needs revision
              </p>
              {weakObjectives.length === 0 ? (
                <p className="mt-1.5 text-sm font-semibold">Nothing flagged right now.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {weakObjectives.map(([oid, e]) => (
                    <li key={oid} className="rounded-xl border border-tang-400/40 bg-tang-100/60 px-3 py-2 text-xs font-bold text-tang-700">
                      <span className="font-black">{oid}</span> — best {e.bestScore}% over {e.attempts} attempt{e.attempts > 1 ? "s" : ""}
                      <span className="block font-semibold">Suggested: re-read notes, flip flashcards, retry the quiz.</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">
                <CircleCheck size={14} strokeWidth={2.75} /> Mastered ({strongObjectives.length})
              </p>
              {strongObjectives.length === 0 ? (
                <p className="mt-1.5 text-sm font-semibold text-slate-muted">
                  Mastery requires repeated strong evidence (80%+ across 2+ attempts) — clicking through doesn't count.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {strongObjectives.map(([oid]) => (
                    <Badge key={oid} tone="mint">{oid} · mastered</Badge>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">Attempt history</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead>
                  <tr className="text-slate-muted">
                    <th className="py-1.5 pr-3 font-extrabold">Date</th>
                    <th className="py-1.5 pr-3 font-extrabold">Lesson</th>
                    <th className="py-1.5 pr-3 text-right font-extrabold">Score</th>
                    <th className="py-1.5 pr-3 font-extrabold">Band</th>
                    <th className="py-1.5 text-right font-extrabold">XP</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {[...attempts].reverse().slice(0, 12).map((a, i) => {
                    const l = lessons.find((x) => x.lessonId === a.lessonId) ?? (a.lessonId === masterLesson.lessonId ? masterLesson : undefined);
                    const chLabel = l?.chapterId === masterLesson.chapterId ? "Master Chapter" : chapterById(l?.chapterId ?? "")?.title;
                    return (
                      <tr key={a.id} className={i % 2 === 0 ? "border-t border-line bg-stage/60" : "border-t border-line"}>
                        <td className="py-2 pr-3 font-semibold whitespace-nowrap">{a.dateISO.slice(0, 10)}</td>
                        <td className="py-2 pr-3 font-bold">{l?.title} <span className="font-semibold text-slate-muted">({chLabel})</span></td>
                        <td className="py-2 pr-3 text-right font-black">{a.scorePercent}% <span className="font-semibold text-slate-muted">({a.autoCorrect}/{a.autoTotal})</span></td>
                        <td className="py-2 pr-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-black ${a.band === "progress" ? "bg-mint-100 text-mint-800" : a.band === "practice" ? "bg-tang-100 text-tang-700" : "bg-coral-100 text-coral-700"}`}>
                            {a.band}
                          </span>
                        </td>
                        <td className="py-2 text-right font-black">+{a.xpEarned}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
