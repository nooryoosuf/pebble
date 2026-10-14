import { Link } from "react-router-dom";
import { ArrowLeft, CircleCheck } from "lucide-react";
import { Button, Card, Badge, ProgressBar } from "../components/ui";
import { AchievementBadge, TrophyArt } from "../components/art";
import { lessons, milestones, specialBadges, consistencyBadges } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { cn } from "../components/ui";

export default function Achievements() {
  const { progress } = useProgress();
  const earned = new Set(progress.earnedBadges);
  const totalCount = milestones.length + specialBadges.length + consistencyBadges.length;
  const badgeXp =
    milestones.filter((m) => earned.has(m.milestoneId)).reduce((s, m) => s + m.xpReward, 0) +
    specialBadges.filter((b) => earned.has(b.badgeId)).reduce((s, b) => s + b.xpReward, 0) +
    consistencyBadges.filter((b) => earned.has(b.badgeId)).reduce((s, b) => s + b.xpReward, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-black text-muted hover:text-sky-700">
        <ArrowLeft size={15} strokeWidth={3} /> Profile
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] border-b-8 border-sun-500 bg-sun-400 p-6 text-center">
        <div className="flex justify-center"><TrophyArt size={76} /></div>
        <h1 className="mt-1 text-3xl font-black text-[#5c3d00]">Achievement gallery</h1>
        <p className="text-sm font-black text-[#5c3d00]/80">
          {earned.size}/{totalCount} unlocked · +{badgeXp} XP from medals
        </p>
        <ProgressBar value={earned.size} max={totalCount} bar="bg-white" className="mx-auto mt-2 max-w-56 bg-black/15" />
      </section>

      {/* chapter milestones */}
      <section>
        <h2 className="text-lg font-black text-ink">World trophies</h2>
        <p className="text-[13px] font-bold text-muted">Clear every mission in a world to lift its trophy.</p>
        <div className="mt-2 space-y-2.5">
          {milestones.map((m) => {
            const chLessons = lessons.filter((l) => l.chapterId === m.chapterId);
            const done = chLessons.filter((l) => progress.completedLessons.includes(l.lessonId)).length;
            const isEarned = earned.has(m.milestoneId);
            return (
              <Card key={m.milestoneId} className={cn(!isEarned && "bg-white/70")}>
                <div className="flex items-center gap-3.5">
                  <AchievementBadge id={m.milestoneId} size={68} earned={isEarned} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-black text-ink">{m.title} <span className="text-xs font-black text-sun-500">+{m.xpReward} XP</span></p>
                    <p className="text-[13px] leading-snug font-bold text-muted">{m.description}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={done} max={chLessons.length} bar={isEarned ? "bg-mint-400" : "bg-sun-400"} className="max-w-40" />
                      <span className="text-xs font-black tabular-nums text-ink">{done}/{chLessons.length}</span>
                    </div>
                    {!isEarned && (
                      <p className="mt-1 text-xs font-bold text-muted">
                        Next: replay “{chLessons.find((l) => !progress.completedLessons.includes(l.lessonId))?.title ?? "—"}” on the trail.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* special badges */}
      <section>
        <h2 className="text-lg font-black text-ink">Skill medals</h2>
        <p className="text-[13px] font-bold text-muted">Proof of real understanding — not just showing up.</p>
        <div className="mt-2 space-y-2.5">
          {specialBadges.map((b) => {
            const isEarned = earned.has(b.badgeId);
            const linked = b.linkedObjectiveIds.map((oid) => ({
              oid,
              mastered: progress.objectiveMastery[oid]?.mastered ?? false,
              best: progress.objectiveMastery[oid]?.bestScore,
            }));
            return (
              <Card key={b.badgeId} className={cn(!isEarned && "bg-white/70")}>
                <div className="flex items-center gap-3.5">
                  <AchievementBadge id={b.badgeId} size={68} earned={isEarned} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-black text-ink">{b.title} <span className="text-xs font-black text-sun-500">+{b.xpReward} XP</span></p>
                    <p className="text-[13px] leading-snug font-bold text-muted">{b.criteria}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {linked.map((l) => (
                        <Badge key={l.oid} tone={l.mastered ? "mint" : "neutral"}>
                          {l.mastered ? <CircleCheck size={11} strokeWidth={3} /> : null}
                          {l.oid}{l.best !== undefined && !l.mastered ? ` · ${l.best}%` : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* consistency */}
      <section>
        <h2 className="text-lg font-black text-ink">Grit club</h2>
        <p className="text-[13px] font-bold text-muted">Showing up and bouncing back.</p>
        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          {[
            { id: "bdg-streak-3", prog: Math.min(progress.streakDays, 3), max: 3, hint: `${progress.streakDays}/3-day streak` },
            { id: "bdg-streak-7", prog: Math.min(progress.streakDays, 7), max: 7, hint: `${progress.streakDays}/7-day streak` },
          ].map((c) => {
            const meta = consistencyBadges.find((b) => b.badgeId === c.id)!;
            const isEarned = earned.has(c.id);
            return (
              <Card key={c.id} className={cn("text-center", !isEarned && "bg-white/70")}>
                <div className="flex justify-center">
                  <AchievementBadge id={c.id} size={64} earned={isEarned} />
                </div>
                <p className="mt-1 text-sm font-black">{meta.title} <span className="text-xs font-black text-sun-500">+{meta.xpReward}</span></p>
                <ProgressBar value={c.prog} max={c.max} bar="bg-tang-400" className="mx-auto mt-1.5 max-w-32" />
                <p className="mt-1 text-xs font-bold text-muted">{c.hint}</p>
              </Card>
            );
          })}
          {[
            { id: "bdg-comeback", hint: "Score 20%+ higher on a mission replay" },
            { id: "bdg-reviser", hint: progress.challengeDays.length > 0 ? `${progress.challengeDays.length} showdown${progress.challengeDays.length > 1 ? "s" : ""} cleared` : "Finish a weekly showdown" },
          ].map((c) => {
            const meta = consistencyBadges.find((b) => b.badgeId === c.id)!;
            const isEarned = earned.has(c.id);
            return (
              <Card key={c.id} className={cn("text-center", !isEarned && "bg-white/70")}>
                <div className="flex justify-center">
                  <AchievementBadge id={c.id} size={64} earned={isEarned} />
                </div>
                <p className="mt-1 text-sm font-black">{meta.title} <span className="text-xs font-black text-sun-500">+{meta.xpReward}</span></p>
                <p className="mt-1 text-xs font-bold text-muted">{isEarned ? "Unlocked — nicely done!" : c.hint}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-2 pb-2 sm:grid-cols-2">
        <Link to="/profile"><Button variant="white" className="w-full"><ArrowLeft size={15} strokeWidth={3} /> Back to profile</Button></Link>
        <Link to="/journey"><Button className="w-full">Keep earning</Button></Link>
      </div>
    </div>
  );
}
