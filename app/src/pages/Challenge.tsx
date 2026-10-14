import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Swords, CircleCheck, CircleX, Lightbulb, ArrowRight } from "lucide-react";
import PebbleMascot from "../components/PebbleMascot";
import { Button, Card, Badge, ScoreRing } from "../components/ui";
import { TrophyArt, ConfettiBurst, EmptyArt } from "../components/art";
import { Gloss } from "../components/Gloss";
import { lessons, lessonById } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { cn } from "../components/ui";

export default function Challenge() {
  const { progress, weeklyRevisionSet, completeChallenge } = useProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const items = useMemo(
    () =>
      weeklyRevisionSet
        .map((s) => {
          const l = lessonById(s.lessonId);
          const q = l?.mcqs.find((m) => m.id === s.mcqId);
          return l && q ? { lesson: l, q } : null;
        })
        .filter(Boolean) as { lesson: (typeof lessons)[number]; q: (typeof lessons)[number]["mcqs"][number] }[],
    [weeklyRevisionSet],
  );

  const correct = items.filter((i) => (answers[i.q.id] ?? "").toUpperCase() === i.q.correctAnswer).length;
  const pct = items.length ? Math.round((correct / items.length) * 100) : 0;

  if (progress.attempts.length === 0) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <PebbleMascot mood="think" message="Clear at least one mission first — then I'll build your showdown from it!" />
          <Link to="/dashboard"><Button className="mt-4 w-full">Go to today's mission <ArrowRight size={16} strokeWidth={3} /></Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="dot-grid relative overflow-hidden rounded-[2rem] border-b-8 border-tang-500 bg-tang-400 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <TrophyArt size={84} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.16em] text-white/90 uppercase">
              <Swords size={14} strokeWidth={3} /> Weekly showdown
            </p>
            <h1 className="text-2xl font-black text-white drop-shadow-[0_2px_0_rgba(124,67,0,.4)]">
              {items.length} questions across your trail
            </h1>
            <p className="text-sm font-bold text-white/95">Mixed recall from every world · big XP energy</p>
          </div>
        </div>
      </section>

      {!done ? (
        <div className="mt-4 space-y-2.5">
          {items.map(({ lesson, q }, i) => (
            <Card key={q.id}>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="tang">Q{i + 1}</Badge>
                <span className="text-[11px] font-black text-faint uppercase">from “{lesson.title}” · {q.objectiveId}</span>
              </div>
              <p className="mt-1.5 text-[15px] font-black text-ink">{q.question}</p>
              <div className="mt-2.5 grid gap-2">
                {(Object.keys(q.options) as ("A" | "B" | "C" | "D")[]).map((k) => {
                  const selected = answers[q.id] === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setAnswers((p) => ({ ...p, [q.id]: k }))}
                      aria-pressed={selected}
                      className={cn(
                        "duo-press flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-sm font-bold",
                        selected ? "border-tang-400 bg-tang-100 text-tang-700 shadow-[0_3px_0_#ffe9cf]" : "border-line bg-white text-ink hover:border-tang-400/60",
                      )}
                    >
                      <span className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-black",
                        selected ? "border-tang-500 bg-tang-400 text-white" : "border-line bg-stage text-muted",
                      )}>{k}</span>
                      {q.options[k]}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
          <Button variant="tang" className="w-full text-base" disabled={Object.keys(answers).length < items.length} onClick={() => { completeChallenge(); setDone(true); window.scrollTo({ top: 0 }); }}>
            {Object.keys(answers).length < items.length ? `Answer all ${items.length} (${Object.keys(answers).length}/${items.length})` : "Finish showdown"}
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          <Card className="relative overflow-hidden text-center">
            <ConfettiBurst />
            <PebbleMascot mood={pct >= 80 ? "star" : "happy"} message={pct >= 80 ? `Champion! ${pct}% — medal material!` : `${pct}% — a strong workout. Replay the wobbly ones below.`} />
            <div className="mt-3 flex justify-center"><ScoreRing pct={pct} /></div>
            <p className="mt-1 text-sm font-black text-ink">{correct}/{items.length} correct</p>
            <div className="mt-2 flex justify-center gap-2">
              <Badge tone={pct >= 80 ? "mint" : "tang"}>{pct >= 80 ? "Showdown cleared!" : "Keep rolling"}</Badge>
            </div>
          </Card>
          {items.map(({ lesson, q }) => {
            const ok = (answers[q.id] ?? "").toUpperCase() === q.correctAnswer;
            return (
              <Card key={q.id}>
                <p className="flex items-start gap-1.5 text-sm font-black text-ink">
                  {ok ? <CircleCheck size={17} strokeWidth={2.75} className="mt-0.5 shrink-0 text-mint-500" /> : <CircleX size={17} strokeWidth={2.75} className="mt-0.5 shrink-0 text-coral-500" />}
                  {q.question}
                </p>
                <p className="mt-1 flex items-start gap-1 text-xs font-bold text-muted">
                  <Lightbulb size={13} strokeWidth={2.75} className="mt-0.5 shrink-0 text-sun-500" /><Gloss text={q.explanation} />
                </p>
                {!ok && (
                  <Link to={`/lesson/${lesson.lessonId}`} className="mt-1.5 inline-block text-xs font-black text-sky-700 underline">
                    Replay “{lesson.title}” <ArrowRight size={12} strokeWidth={3} className="inline" />
                  </Link>
                )}
              </Card>
            );
          })}
          <div className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-white p-3">
            <EmptyArt className="h-14 w-auto shrink-0" />
            <p className="text-xs font-bold text-muted">Want a better score? Replay the linked missions, then hit retry.</p>
          </div>
          <Button variant="white" className="w-full" onClick={() => { setAnswers({}); setDone(false); }}>Retry showdown</Button>
        </div>
      )}
    </div>
  );
}
