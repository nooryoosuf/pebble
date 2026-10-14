import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Map as MapIcon,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import PebbleMascot from "../components/PebbleMascot";
import { Button, Card, Badge, ProgressBar } from "../components/ui";
import { AchievementBadge, FlameArt, BoltArt } from "../components/art";
import { chapters, lessons } from "../data/curriculum";
import { useProgress, levelForXp } from "../lib/store";

function startOfWeekMonday(d: Date): Date {
  const c = new Date(d);
  const dow = (c.getDay() + 6) % 7; // Mon=0
  c.setDate(c.getDate() - dow);
  c.setHours(12, 0, 0, 0);
  return c;
}

export default function Profile() {
  const { progress, isLoggedIn } = useProgress();
  const { level, intoLevel, levelSize } = levelForXp(progress.xp);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <div className="flex justify-center"><PebbleMascot mood="happy" size={110} /></div>
          <p className="mt-2 text-lg font-black">This is your profile-to-be!</p>
          <p className="text-sm font-bold text-muted">Sign in so Pebble can pin your stats, streaks and medals here.</p>
          <Link to="/start"><Button className="mt-4 w-full">Get started <ArrowRight size={16} strokeWidth={3} /></Button></Link>
        </Card>
      </div>
    );
  }

  const totalObjectives = chapters
    .flatMap((c) => c.topics)
    .flatMap((t) => t.learningObjectives).length;
  const masteredCount = Object.values(progress.objectiveMastery).filter((e) => e.mastered).length;
  const since = [...progress.studyDates].sort()[0];
  const monday = startOfWeekMonday(new Date());
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const dayAttempts = progress.attempts.filter((a) => a.dateISO.slice(0, 10) === key).length;
    return {
      key,
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      studied: progress.studyDates.includes(key),
      dayAttempts,
      isToday: key === new Date().toISOString().slice(0, 10),
    };
  });

  const stats = [
    { icon: <FlameArt size={22} />, value: `${progress.streakDays}`, unit: "days", label: "Day streak" },
    { icon: <BoltArt size={22} />, value: `${progress.xp}`, unit: `Lv ${level}`, label: "Experience" },
    { icon: <MapIcon size={20} strokeWidth={2.5} className="text-muted" />, value: `${progress.completedLessons.length}/${lessons.length}`, unit: "", label: "Missions done" },
    { icon: <CalendarDays size={20} strokeWidth={2.5} className="text-muted" />, value: `${progress.studyDates.length}`, unit: "days", label: "Study days" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* identity header */}
      <section className="dot-grid overflow-hidden rounded-[2rem] border-b-8 border-sky-500 bg-sky-400 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-white/70 bg-white/25">
            <PebbleMascot mood="happy" size={72} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-3xl font-black text-white drop-shadow-[0_2px_0_rgba(11,111,164,.4)]">
              {progress.userName}
            </h1>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge tone="sun" className="border-white/60 bg-white">{progress.role === "student" ? "Student" : "Parent"}</Badge>
              <Badge tone="sun" className="border-white/60 bg-white/90 text-ink">Level {level}</Badge>
              <Badge tone="sun" className="border-white/60 bg-white/90 text-ink">
                Rolling since {since ?? "today"}
              </Badge>
            </div>
            <ProgressBar value={intoLevel} max={levelSize} bar="bg-sun-400" className="mt-2.5 max-w-56 bg-white/30" />
            <p className="mt-1 text-[11px] font-black text-white/90">{intoLevel}/{levelSize} XP to level {level + 1}</p>
          </div>
        </div>
      </section>

      {/* monotone translucent stat grid */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="Lifetime stats">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border-2 border-line/70 bg-white/70 p-3.5 text-center backdrop-blur-[2px]">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-black/[0.05]">{s.icon}</span>
            <p className="mt-1.5 text-xl leading-none font-black text-ink">
              {s.value} {s.unit && <span className="text-[11px] font-black text-muted">{s.unit}</span>}
            </p>
            <p className="mt-0.5 text-[10px] font-black tracking-wider text-muted uppercase">{s.label}</p>
          </div>
        ))}
      </section>

      {/* weekly activity */}
      <Card>
        <p className="text-[11px] font-black tracking-wider text-muted uppercase">This week · daily rhythm</p>
        <div className="mt-3 grid grid-cols-7 gap-1.5" role="img" aria-label="Study activity for each day this week">
          {week.map((d) => (
            <div key={d.key} title={`${d.key}: ${d.dayAttempts} attempts`} className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-2 ${d.isToday ? "border-sky-400 bg-sky-100/50" : "border-line/70 bg-white/60"}`}>
              <span className={`text-[11px] font-black ${d.isToday ? "text-sky-700" : "text-muted"}`}>{d.label}</span>
              <span className={`grid h-8 w-8 place-items-center rounded-full ${d.studied ? "bg-mint-400 text-white" : "bg-black/[0.06] text-faint"}`}>
                {d.studied ? (
                  <svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <span className="text-xs font-black">·</span>
                )}
              </span>
              <span className="text-[10px] font-black tabular-nums text-muted">{d.dayAttempts > 0 ? `×${d.dayAttempts}` : "—"}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* mastery snapshot */}
      <Card>
        <p className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-muted uppercase">
          <ShieldCheck size={14} strokeWidth={2.75} /> Topic mastery · {masteredCount}/{totalObjectives}
        </p>
        <ProgressBar value={masteredCount} max={totalObjectives} className="mt-2" />
        <p className="mt-1.5 text-xs font-bold text-muted">
          Mastery needs repeated strong evidence (80%+ across 2+ tries) — quick clicks don't count.
        </p>
      </Card>

      {/* achievements teaser */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-muted uppercase">
            <Trophy size={14} strokeWidth={2.75} /> Medals · {progress.earnedBadges.length}
          </p>
          <Link to="/achievements" className="inline-flex items-center gap-1 text-xs font-black text-sky-700 hover:underline">
            Full gallery <ArrowRight size={13} strokeWidth={3} />
          </Link>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {["ms-01", "bdg-flawless-balance", "bdg-streak-3", "bdg-reviser"].map((id) => {
            const earned = progress.earnedBadges.includes(id);
            return (
              <div key={id} className="flex justify-center rounded-2xl border border-line/60 bg-white/60 py-1.5">
                <AchievementBadge id={id} size={48} earned={earned} />
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link to="/achievements"><Button variant="blue" className="w-full">Achievements</Button></Link>
          {progress.role === "parent" ? (
            <Link to="/parent"><Button variant="white" className="w-full"><Users size={16} strokeWidth={2.75} /> Parent reports</Button></Link>
          ) : (
            <Link to="/challenge"><Button variant="white" className="w-full"><Swords size={16} strokeWidth={2.75} /> Weekly showdown</Button></Link>
          )}
        </div>
      </Card>
    </div>
  );
}
