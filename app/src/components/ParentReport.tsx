import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleCheck,
  TriangleAlert,
  ArrowRight,
  FileText,
  Copy,
  Check,
  Footprints,
} from "lucide-react";
import { Card } from "./ui";
import { chapters, lessons, masterLesson, isMasterComplete, isMasterUnlocked } from "../data/curriculum";
import { useProgress } from "../lib/store";

/* ─── Written parent report ──────────────────────────────────────────────────
   Turns recorded activity (never invented data) into a plain-language letter:
   how the child is doing, where they shine, what needs support, and the next
   concrete steps. Rendered only when at least one attempt exists.
----------------------------------------------------------------------------- */

function topicForObjective(oid: string): { lessonTitle: string; lessonId: string } | null {
  const l = lessons.find(
    (x) =>
      x.mcqs.some((q) => q.objectiveId === oid) ||
      x.trueFalse.some((q) => q.objectiveId === oid) ||
      x.shortAnswer.some((q) => q.objectiveId === oid),
  );
  return l ? { lessonTitle: l.title, lessonId: l.lessonId } : null;
}

interface Gap {
  text: string;
  lessonId: string;
  lessonTitle: string;
}
interface Step {
  text: string;
  to: string;
  cta: string;
}

export default function ParentReport() {
  const { progress } = useProgress();
  const [copied, setCopied] = useState(false);
  const attempts = progress.attempts;
  if (attempts.length === 0) return null;

  const name = progress.userName || "your child";
  const possessive = `${progress.userName || "their"}'s`;
  const avg = Math.round(attempts.reduce((s, a) => s + a.scorePercent, 0) / attempts.length);

  const verdict =
    avg >= 80
      ? "is doing really well — scores are consistently high and understanding looks secure"
      : avg >= 60
        ? "is making steady progress — the foundations are forming and regular practice is paying off"
        : avg >= 40
          ? "is finding their feet — this is the stage where short, supported sessions help the most"
          : "is finding this tricky right now — gentle support and small wins will matter more than long sessions";

  // chapter performance (attempted chapters only)
  const chAvgs = chapters
    .map((c) => {
      const ids = lessons.filter((l) => l.chapterId === c.chapterId).map((l) => l.lessonId);
      const rel = attempts.filter((a) => ids.includes(a.lessonId));
      return {
        chapter: c,
        avg: rel.length ? Math.round(rel.reduce((s, a) => s + a.scorePercent, 0) / rel.length) : null,
      };
    })
    .filter((x) => x.avg !== null) as { chapter: (typeof chapters)[number]; avg: number }[];

  const strengths = [...chAvgs]
    .filter((x) => x.avg >= 70)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 2)
    .map((x) => `${x.chapter.title} (averaging ${x.avg}%)`);
  if (strengths.length === 0 && chAvgs.length > 0) {
    const best = [...chAvgs].sort((a, b) => b.avg - a.avg)[0];
    strengths.push(`Strongest so far: ${best.chapter.title} (averaging ${best.avg}%)`);
  }
  const masteredCount = Object.values(progress.objectiveMastery).filter((e) => e.mastered).length;

  // gaps: weakest attempted chapters + weakest touched objectives
  const gaps: Gap[] = [];
  for (const x of [...chAvgs].filter((y) => y.avg < 70).sort((a, b) => a.avg - b.avg).slice(0, 2)) {
    const ids = lessons.filter((l) => l.chapterId === x.chapter.chapterId).map((l) => l.lessonId);
    const rel = attempts.filter((a) => ids.includes(a.lessonId));
    const worst = [...rel].sort((a, b) => a.scorePercent - b.scorePercent)[0];
    const wl = lessons.find((l) => l.lessonId === worst.lessonId)!;
    gaps.push({
      text: `${x.chapter.title} (averaging ${x.avg}%) — lowest in “${wl.title}” at ${worst.scorePercent}%`,
      lessonId: wl.lessonId,
      lessonTitle: wl.title,
    });
  }
  const weakObj = Object.entries(progress.objectiveMastery)
    .filter(([, e]) => !e.mastered && e.attempts > 0 && e.bestScore < 60)
    .sort((a, b) => a[1].bestScore - b[1].bestScore);
  for (const [oid, e] of weakObj.slice(0, 3)) {
    const t = topicForObjective(oid);
    if (!t) continue;
    if (gaps.some((g) => g.lessonId === t.lessonId)) continue;
    gaps.push({
      text: `${t.lessonTitle} (best ${e.bestScore}% over ${e.attempts} tr${e.attempts > 1 ? "ies" : "y"})`,
      lessonId: t.lessonId,
      lessonTitle: t.lessonTitle,
    });
    if (gaps.length >= 3) break;
  }

  // next steps
  const steps: Step[] = [];
  const nextLesson = lessons.find((l) => !progress.completedLessons.includes(l.lessonId));
  if (nextLesson) {
    steps.push({
      text: `Keep momentum: start “${nextLesson.title}” next (~${nextLesson.estimatedMinutes} min).`,
      to: `/lesson/${nextLesson.lessonId}`,
      cta: "Open mission",
    });
  } else if (isMasterUnlocked(progress.completedLessons) && !isMasterComplete(progress.attempts)) {
    steps.push({
      text: `The big one is ready: all 12 missions are clear, so “${masterLesson.title}” — fresh mixed questions from every world — is unlocked.`,
      to: `/lesson/${masterLesson.lessonId}`,
      cta: "Open finale",
    });
  }
  const bestByLesson = new Map<string, number>();
  for (const a of attempts) {
    bestByLesson.set(a.lessonId, Math.max(bestByLesson.get(a.lessonId) ?? 0, a.scorePercent));
  }
  const lowest = [...bestByLesson.entries()].sort((a, b) => a[1] - b[1])[0];
  if (lowest && lowest[1] < 80) {
    const l = lessons.find((x) => x.lessonId === lowest[0])!;
    steps.push({
      text: `Repair the wobble: replay “${l.title}” (best ${lowest[1]}%) — a re-read plus flashcards first.`,
      to: `/lesson/${l.lessonId}`,
      cta: "Replay",
    });
  }
  if (progress.streakDays >= 2) {
    steps.push({
      text: `Protect the streak: ${progress.streakDays} days and counting — one short session today keeps it alive.`,
      to: "/journey",
      cta: "See trail",
    });
  } else {
    steps.push({
      text: "Build the habit: one small mission today starts a streak — consistency beats cramming.",
      to: "/journey",
      cta: "See trail",
    });
  }

  const lastActive = [...attempts].reverse()[0].dateISO.slice(0, 10);
  const basis = `Based on ${attempts.length} recorded attempt${attempts.length > 1 ? "s" : ""} across ${progress.studyDates.length} study day${progress.studyDates.length === 1 ? "" : "s"} · last active ${lastActive}`;

  const plainText = [
    `Pebble report for ${name} — ${new Date().toISOString().slice(0, 10)}`,
    ``,
    `Overall: ${name} ${verdict}. Average score ${avg}% with a ${progress.streakDays}-day streak and ${progress.completedLessons.length}/${lessons.length} lessons complete.`,
    ``,
    `Doing well in:`,
    ...strengths.map((s) => `• ${s}`),
    ...(masteredCount > 0 ? [`• ${masteredCount} topic${masteredCount > 1 ? "s" : ""} fully mastered`] : []),
    ``,
    gaps.length > 0 ? `Needs support with:` : `Nothing flagged — no weak spots in the recorded attempts.`,
    ...gaps.map((g) => `• ${g.text} → retry “${g.lessonTitle}”`),
    ``,
    `Suggested next steps:`,
    ...steps.map((s, i) => `${i + 1}. ${s.text}`),
    ``,
    basis,
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Card className="border-line bg-white">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-slate-muted uppercase">
          <FileText size={14} strokeWidth={2.75} /> Written report · {new Date().toISOString().slice(0, 10)}
        </p>
        <button
          onClick={copy}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-line px-2.5 py-1.5 text-xs font-black text-slate-muted transition hover:border-sky-400 hover:text-sky-700"
        >
          {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} strokeWidth={3} />}
          {copied ? "Copied!" : "Copy report"}
        </button>
      </div>

      <p className="mt-2 text-[15px] leading-relaxed font-semibold text-slate-ink">
        {name} {verdict}. Across {attempts.length} recorded attempt{attempts.length > 1 ? "s" : ""}, the
        average score is <strong>{avg}%</strong>, with {progress.completedLessons.length} of {lessons.length} lessons
        complete{progress.streakDays > 0 ? <> and a <strong>{progress.streakDays}-day streak</strong></> : " — a first streak is one short session away"}.
      </p>

      {strengths.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.12em] text-slate-muted uppercase">
            <CircleCheck size={13} strokeWidth={3} className="text-mint-500" /> Doing well in
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {strengths.map((s) => (
              <li key={s} className="rounded-xl bg-mint-50 px-3 py-2 text-[13px] font-bold text-slate-ink">{s}</li>
            ))}
            {masteredCount > 0 && (
              <li className="rounded-xl bg-mint-50 px-3 py-2 text-[13px] font-bold text-slate-ink">
                {masteredCount} topic{masteredCount > 1 ? "s" : ""} fully mastered (proven across repeat attempts)
              </li>
            )}
          </ul>
        </div>
      )}

      {gaps.length > 0 ? (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.12em] text-slate-muted uppercase">
            <TriangleAlert size={13} strokeWidth={3} className="text-tang-500" /> Needs support with
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {gaps.map((g) => (
              <li key={g.lessonId + g.text} className="rounded-xl bg-tang-100/60 px-3 py-2 text-[13px] font-bold text-slate-ink">
                {g.text}
                <span className="mt-0.5 block font-semibold text-slate-muted">Try: re-read the notes, flip the flashcards, then replay the quiz.</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-stage px-3 py-2 text-[13px] font-bold text-slate-muted">
          Nothing flagged — every attempted area sits at a healthy level. Time to push into new missions.
        </p>
      )}

      <div className="mt-3">
        <p className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.12em] text-slate-muted uppercase">
          <Footprints size={13} strokeWidth={3} className="text-sky-500" /> Suggested next steps for {possessive} week
        </p>
        <ol className="mt-1.5 space-y-1.5">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2 text-[13px] font-bold">
              <span><span className="mr-1.5 font-black text-sky-500">{i + 1}.</span>{s.text}</span>
              <Link to={s.to} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-sky-400 px-2.5 py-1.5 text-[11px] font-black text-white hover:bg-sky-500">
                {s.cta} <ArrowRight size={12} strokeWidth={3} />
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-3 border-t border-line pt-2 text-[11px] font-semibold text-slate-muted">{basis}</p>
    </Card>
  );
}
