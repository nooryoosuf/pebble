import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Target,
  RotateCcw,
  TriangleAlert,
  CircleCheck,
  Map as MapIcon,
  Swords,
  Sprout,
  Calculator,
  Ship,
  Building2,
  Crown,
} from "lucide-react";
import PebbleMascot from "../components/PebbleMascot";
import { Button, Card, Badge, ProgressBar } from "../components/ui";
import { ChapterArt, AchievementBadge, FlameArt, BoltArt, TrophyArt } from "../components/art";
import { BadgeSpotlight } from "../components/BadgeOverlays";
import { lessons, chapterById, milestones, specialBadges, consistencyBadges, masterLesson, isMasterComplete } from "../data/curriculum";
import { useProgress, levelForXp } from "../lib/store";

const chapterIcon: Record<string, typeof Sprout> = {
  "ch-01": Sprout,
  "ch-02": Calculator,
  "ch-03": Ship,
  "ch-04": Building2,
};

const mascotLine = (pct: number | null) => {
  if (pct === null) return "One mission a day keeps the forgetting away. Let's roll today's pebble!";
  if (pct >= 80) return "Pebble-tastic! You smashed that. Onwards to the next stone!";
  if (pct >= 50) return "Good stepping! A little practise and this path will be smooth.";
  return "Every pebble starts small. Let's revise together and retry — you've got this.";
};

export default function Dashboard() {
  const { progress, todayLesson, recommendedRevision, isLoggedIn, accountRole } = useProgress();
  const { level, intoLevel, levelSize } = levelForXp(progress.xp);
  const lastAttempt = progress.attempts[progress.attempts.length - 1];
  const doneCount = progress.completedLessons.length;
  const weekCount = progress.studyDates.slice(-7).length;
  const ChapterGlyph = chapterIcon[todayLesson.chapterId] ?? Crown;
  const isMasterDay = todayLesson.lessonId === masterLesson.lessonId;
  const masterDone = isMasterComplete(progress.attempts);
  const [spotId, setSpotId] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <div className="flex justify-center"><PebbleMascot mood="think" size={110} /></div>
          <p className="mt-2 text-lg font-black">Hop in, future founder!</p>
          <p className="text-sm font-bold text-muted">Sign in so your medals and streaks have a home.</p>
          <Link to="/start"><Button className="mt-4 w-full">Get started <ArrowRight size={16} strokeWidth={3} /></Button></Link>
        </Card>
      </div>
    );
  }

  if (accountRole === "parent") {
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <div className="flex justify-center"><PebbleMascot mood="happy" size={110} /></div>
          <p className="mt-2 text-lg font-black">You're signed in as a parent</p>
          <p className="text-sm font-bold text-muted">Missions belong to student accounts. Follow your child's progress in reports.</p>
          <Link to="/parent"><Button className="mt-4 w-full">Open parent reports <ArrowRight size={16} strokeWidth={3} /></Button></Link>
        </Card>
      </div>
    );
  }

  const allBadges = [
    ...milestones.map((m) => ({ id: m.milestoneId, title: m.title, xp: m.xpReward })),
    ...specialBadges.map((b) => ({ id: b.badgeId, title: b.title, xp: b.xpReward })),
    ...consistencyBadges.map((b) => ({ id: b.badgeId, title: b.title, xp: b.xpReward })),
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {/* today's mission hero */}
        <section className="dot-grid relative overflow-hidden rounded-[2rem] border-b-8 border-mint-500 bg-mint-400 p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black tracking-[0.18em] uppercase opacity-90">
                Today's mission · Day goal
              </p>
              <h2 className="mt-1 flex items-center gap-2 text-2xl font-black drop-shadow-[0_2px_0_rgba(53,107,0,.4)]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/25">
                  <ChapterGlyph size={22} strokeWidth={2.5} />
                </span>
                {todayLesson.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="sun" className="border-white/60 bg-white text-mint-800">{isMasterDay ? "Master Chapter" : chapterById(todayLesson.chapterId)?.title}</Badge>
                <Badge tone="sun" className="border-white/60 bg-white/90 text-ink">pp. {todayLesson.pages.start}–{todayLesson.pages.end}</Badge>
                <Badge tone="sun" className="border-white/60 bg-white/90 text-ink">~{todayLesson.estimatedMinutes} min</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Link to={`/lesson/${todayLesson.lessonId}`}>
                  <Button variant="sun" className="text-base">Start mission <ArrowRight size={17} strokeWidth={3} /></Button>
                </Link>
                <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 px-3 py-2 text-xs font-black">
                  <Target size={14} strokeWidth={3} /> Goal: {progress.goals.lessonsPerWeek} missions/week
                </span>
              </div>
            </div>
            <div className="hidden w-44 shrink-0 rounded-3xl bg-white/20 p-2 sm:block">
              {isMasterDay ? <TrophyArt size={120} /> : <ChapterArt chapterId={todayLesson.chapterId} className="h-auto w-full" />}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/20 p-3 backdrop-blur-[1px]">
            <PebbleMascot mood={lastAttempt && lastAttempt.scorePercent < 50 ? "sad" : "happy"} size={56} />
            <p className="text-sm font-bold">{mascotLine(lastAttempt ? lastAttempt.scorePercent : null)}</p>
          </div>
        </section>

        {/* Master Chapter unlock banner */}
        {isMasterDay && !masterDone && (
          <Link to={`/lesson/${masterLesson.lessonId}`} className="duo-press flex items-center gap-3 rounded-[2rem] border-b-8 border-sun-500 bg-ink p-4 text-white">
            <TrophyArt size={56} />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-black tracking-[0.16em] text-sun-300 uppercase">Secret finale unlocked</span>
              <span className="block truncate text-lg font-black">The Final Showdown — all worlds, fresh questions</span>
            </span>
            <ArrowRight size={20} strokeWidth={3} className="shrink-0 text-sun-400" />
          </Link>
        )}

        {/* stats trio — soft monotone translucent tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="border-line/70 bg-white/70 p-4 text-center backdrop-blur-[2px]">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-black/[0.05]"><FlameArt size={24} /></span>
            <p className="mt-1.5 text-2xl leading-none font-black text-ink">{progress.streakDays}<span className="text-xs font-black text-muted"> days</span></p>
            <p className="text-[11px] font-black tracking-wider text-muted uppercase">Streak</p>
          </Card>
          <Card className="border-line/70 bg-white/70 p-4 text-center backdrop-blur-[2px]">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-black/[0.05]"><BoltArt size={24} /></span>
            <p className="mt-1.5 text-2xl leading-none font-black text-ink">{progress.xp}<span className="text-xs font-black text-muted"> · Lv{level}</span></p>
            <ProgressBar value={intoLevel} max={levelSize} bar="bg-sun-400" className="mt-2" />
          </Card>
          <Card className="border-line/70 bg-white/70 p-4 text-center backdrop-blur-[2px]">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-black/[0.05] text-muted"><MapIcon size={22} strokeWidth={2.5} /></span>
            <p className="mt-1.5 text-2xl leading-none font-black text-ink">{doneCount}<span className="text-xs font-black text-muted">/{lessons.length}</span></p>
            <ProgressBar value={doneCount} max={lessons.length} bar="bg-sky-400" className="mt-2" />
          </Card>
        </div>

        {/* adaptive revision */}
        {recommendedRevision.length > 0 && (
          <Card className="border-coral-400/40 bg-coral-100/40">
            <p className="flex items-center gap-1.5 text-sm font-black text-coral-700">
              <TriangleAlert size={16} strokeWidth={2.75} /> Pebble spotted some wobbly stones
            </p>
            <div className="mt-2 space-y-1.5">
              {recommendedRevision.map((r) => {
                const l = lessons.find((x) => x.lessonId === r.lessonId)!;
                return (
                  <div key={r.lessonId} className="flex items-center justify-between gap-2 rounded-2xl border-2 border-line bg-white px-3 py-2">
                    <span className="min-w-0 text-sm font-black">{l.title} <span className="block truncate text-xs font-bold text-muted">{r.reason}</span></span>
                    <Link to={`/lesson/${r.lessonId}`} className="shrink-0">
                      <Button variant="coral" className="px-3 py-1.5 text-xs"><RotateCcw size={13} strokeWidth={3} /> Revise</Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </motion.div>

      {/* side column */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="space-y-3">
        <Card className="overflow-hidden">
          <div className="-m-5 mb-3 flex items-center gap-3 bg-grape-100 px-5 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-grape-400 text-white"><Swords size={20} strokeWidth={2.5} /></span>
            <div>
              <p className="text-[11px] font-black tracking-wider text-grape-700 uppercase">This week</p>
              <p className="text-sm font-black">{weekCount} active days · {progress.attempts.length} attempts</p>
            </div>
          </div>
          <ProgressBar value={Math.min(progress.goals.lessonsPerWeek, doneCount)} max={progress.goals.lessonsPerWeek} bar="bg-grape-400" />
          <Link to="/challenge"><Button variant="grape" className="mt-3 w-full">Weekly showdown</Button></Link>
        </Card>

        <Card className="border-line/70 bg-white/70 backdrop-blur-[2px]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-black tracking-wider text-muted uppercase">
              Medal cabinet · {progress.earnedBadges.length}/{allBadges.length}
            </p>
            <Link to="/achievements" className="inline-flex items-center gap-0.5 text-[11px] font-black text-sky-700 hover:underline">
              View all <ArrowRight size={12} strokeWidth={3} />
            </Link>
          </div>
          <div className="mt-1 grid grid-cols-4 gap-1.5">
            {allBadges.map((b) => {
              const earned = progress.earnedBadges.includes(b.id);
              return (
                <button key={b.id} title={`${b.title} · +${b.xp} XP — tap to view`} onClick={() => setSpotId(b.id)} className="flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border border-line/60 bg-white/60 px-1 py-1.5 text-center transition hover:border-sky-400/60">
                  <AchievementBadge id={b.id} size={44} earned={earned} />
                  <span className={`text-[9px] leading-tight font-black ${earned ? "text-ink" : "text-faint"}`}>{b.title}</span>
                </button>
              );
            })}
          </div>
          {progress.earnedBadges.length === 0 && (
            <p className="mt-2 text-xs font-bold text-muted">Clear a world or hold a 3-day streak to win your first medal!</p>
          )}
        </Card>

        <Card>
          <p className="text-[11px] font-black tracking-wider text-muted uppercase">Latest result</p>
          {lastAttempt ? (
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{lessons.find((l) => l.lessonId === lastAttempt.lessonId)?.title}</p>
                <p className="text-xs font-bold text-muted">{lastAttempt.scorePercent}% · +{lastAttempt.xpEarned} XP</p>
              </div>
              {lastAttempt.band === "progress"
                ? <CircleCheck size={26} strokeWidth={2.5} className="shrink-0 text-mint-500" />
                : <Badge tone={lastAttempt.band === "practice" ? "tang" : "coral"}>{lastAttempt.band}</Badge>}
            </div>
          ) : (
            <p className="mt-1 text-sm font-bold text-muted">No attempts yet — your first result will land here.</p>
          )}
        </Card>
      </motion.div>
      {spotId && (
        <BadgeSpotlight id={spotId} earned={progress.earnedBadges.includes(spotId)} onClose={() => setSpotId(null)} />
      )}
    </div>
  );
}
