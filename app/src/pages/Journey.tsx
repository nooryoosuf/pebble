import { Link } from "react-router-dom";
import { Play, Lock, Star, Trophy, Flag } from "lucide-react";
import { Card, Badge, ProgressBar } from "../components/ui";
import { ChapterArt, Medal } from "../components/art";
import PebbleMascot from "../components/PebbleMascot";
import { chapters, lessons } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { cn } from "../components/ui";

const chapterTheme: Record<string, { band: string; bar: string; chip: string; node: string; soft: string }> = {
  "ch-01": { band: "bg-mint-100", bar: "bg-mint-400", chip: "bg-mint-400", node: "text-mint-700", soft: "bg-mint-50" },
  "ch-02": { band: "bg-sky-100", bar: "bg-sky-400", chip: "bg-sky-400", node: "text-sky-700", soft: "bg-sky-100/50" },
  "ch-03": { band: "bg-tang-100", bar: "bg-tang-400", chip: "bg-tang-400", node: "text-tang-700", soft: "bg-tang-100/50" },
  "ch-04": { band: "bg-grape-100", bar: "bg-grape-400", chip: "bg-grape-400", node: "text-grape-700", soft: "bg-grape-100/50" },
};

/* gentle side-to-side offsets so the trail winds like a game map */
const offsets = ["sm:translate-x-0", "sm:translate-x-10", "sm:translate-x-16", "sm:translate-x-10", "sm:translate-x-0", "sm:-translate-x-10", "sm:-translate-x-16", "sm:-translate-x-10"];

export default function Journey() {
  const { progress } = useProgress();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <h1 className="text-3xl font-black text-ink">Your island trail</h1>
        <p className="mt-1 text-sm font-bold text-muted">
          {progress.completedLessons.length} of {lessons.length} pebbles placed · replay any mission, retry any quiz.
        </p>
      </div>

      <div className="mt-5 space-y-8">
        {chapters.map((c) => {
          const t = chapterTheme[c.chapterId];
          const chLessons = lessons.filter((l) => l.chapterId === c.chapterId);
          const done = chLessons.filter((l) => progress.completedLessons.includes(l.lessonId)).length;
          const complete = done === chLessons.length;
          const currentId = chLessons.find((l) => !progress.completedLessons.includes(l.lessonId))?.lessonId;

          return (
            <section key={c.chapterId} aria-label={`World ${c.chapterNumber}: ${c.title}`}>
              {/* world banner */}
              <div className="overflow-hidden rounded-[2rem] border-2 border-line bg-white">
                <div className={cn("flex items-center gap-4 px-5 pt-4 pb-3", t.band)}>
                  <ChapterArt chapterId={c.chapterId} className="h-20 w-32 shrink-0 sm:h-24 sm:w-40" />
                  <div className="min-w-0 flex-1">
                    <span className={cn("inline-block max-w-full overflow-hidden rounded-full px-2.5 py-0.5 text-[11px] font-black tracking-wider text-ellipsis whitespace-nowrap text-white uppercase", t.chip)}>
                      World {c.chapterNumber} · pp. {c.pages.start}–{c.pages.end}
                    </span>
                    <p className="mt-1 text-xl leading-tight font-black text-ink">{c.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={done} max={chLessons.length} bar={t.bar} className="max-w-44" />
                      <span className="text-xs font-black text-ink">{done}/{chLessons.length}</span>
                    </div>
                  </div>
                  {complete ? (
                    <Medal tone="sun" size={52} icon={<Trophy size={22} strokeWidth={2.75} />} />
                  ) : (
                    <Badge tone="neutral" className="bg-white">{done}/{chLessons.length} done</Badge>
                  )}
                </div>

                {/* winding trail */}
                <div className="journey-trail relative space-y-3 px-5 py-5 sm:px-10">
                  {chLessons.map((l, i) => {
                    const isDone = progress.completedLessons.includes(l.lessonId);
                    const isCurrent = l.lessonId === currentId;
                    const attempts = progress.attempts.filter((a) => a.lessonId === l.lessonId);
                    const best = attempts.length ? Math.max(...attempts.map((a) => a.scorePercent)) : null;
                    return (
                      <div key={l.lessonId} className={cn("relative mx-auto w-full max-w-sm transition-transform", offsets[i % offsets.length])}>
                        {isCurrent && (
                          <div className="animate-bob absolute -top-9 left-1/2 z-10 -translate-x-1/2">
                            <span className="rounded-xl border-2 border-mint-500 bg-white px-3 py-1 text-xs font-black tracking-wider text-mint-700 uppercase shadow-sm">
                              Start
                            </span>
                            <span className="mx-auto block h-2 w-2 rotate-45 border-r-2 border-b-2 border-mint-500 bg-white" />
                          </div>
                        )}
                        <Link
                          to={`/lesson/${l.lessonId}`}
                          aria-label={`Mission ${l.topicId.replace("top-", "")}: ${l.title}${isDone ? ", completed" : isCurrent ? ", up next" : ""}${best !== null ? `, best ${best} percent` : ""}`}
                          className={cn(
                            "duo-press flex w-full items-center gap-3 rounded-3xl border-2 bg-white p-3 text-left",
                            isCurrent ? "border-mint-400 shadow-[0_4px_0_#d7ffb8]" : "border-line",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-b-4 text-white",
                              isDone && "border-sun-500 bg-sun-400",
                              isCurrent && "border-mint-500 bg-mint-400",
                              !isDone && !isCurrent && "border-[#cfc8b4] bg-[#e8e3d6] text-faint",
                            )}
                          >
                            {isDone ? <Star size={24} strokeWidth={2.75} fill="currentColor" />
                              : isCurrent ? <Play size={24} strokeWidth={2.75} fill="currentColor" />
                                : <Lock size={20} strokeWidth={2.75} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-black text-ink">
                              {l.topicId.replace("top-", "")} · {l.title}
                            </span>
                            <span className="block truncate text-xs font-bold text-muted">
                              pp. {l.pages.start}–{l.pages.end} · ~{l.estimatedMinutes} min
                              {best !== null && ` · best ${best}%`}
                              {isCurrent && " · up next"}
                            </span>
                          </span>
                          {isCurrent && <PebbleMascot mood="happy" size={44} />}
                        </Link>
                      </div>
                    );
                  })}
                  {/* finish flag */}
                  <div className="flex justify-center pt-1">
                    <span className={cn("flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[11px] font-black tracking-wider uppercase", complete ? "border-sun-500 bg-sun-100 text-sun-700" : "border-line bg-stage text-faint")}>
                      <Flag size={12} strokeWidth={3} /> {complete ? "World cleared!" : "World trophy ahead"}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <Card className="mt-8 flex items-center gap-3 border-dashed">
        <PebbleMascot mood="reading" size={64} />
        <p className="text-sm font-bold text-muted">
          Stuck on a wobbly stone? Open any mission, re-read the notes, flip the flashcards once more — then retry the quiz. Mastery loves replays.
        </p>
      </Card>
    </div>
  );
}
