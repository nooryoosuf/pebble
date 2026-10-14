import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Layers,
  PenLine,
  Trophy,
  RotateCcw,
  CircleCheck,
  CircleX,
  Lightbulb,
  TriangleAlert,
  NotebookPen,
  BriefcaseBusiness,
  ListChecks,
  PartyPopper,
} from "lucide-react";
import PebbleMascot from "../components/PebbleMascot";
import { Button, Card, Badge, ProgressBar, ScoreRing } from "../components/ui";
import { ConfettiBurst, EmptyArt, TrophyArt } from "../components/art";
import { Gloss } from "../components/Gloss";
import { lessonById, chapterById, topicById, autoMarkableCount, masterLesson, isMasterUnlocked } from "../data/curriculum";
import { useProgress, bandFor } from "../lib/store";
import { cn } from "../components/ui";

const stepMeta = [
  { name: "Learn", icon: BookOpenText },
  { name: "Review", icon: Layers },
  { name: "Practise", icon: PenLine },
  { name: "Results", icon: Trophy },
] as const;

export default function LessonView() {
  const { id } = useParams();
  const nav = useNavigate();
  const lesson = lessonById(id ?? "");
  const { recordAttempt, markFlashcardsSeen, progress } = useProgress();

  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [mcq, setMcq] = useState<Record<string, string>>({});
  const [tf, setTf] = useState<Record<string, boolean>>({});
  const [saMarks, setSaMarks] = useState<Record<string, number[]>>({});
  const [challengeDone, setChallengeDone] = useState(false);
  const [challengeText, setChallengeText] = useState("");
  const [resultId, setResultId] = useState<string | null>(null);
  const [startedAt] = useState(Date.now());

  const prevAttempts = useMemo(
    () => (lesson ? progress.attempts.filter((a) => a.lessonId === lesson.lessonId) : []),
    [progress.attempts, lesson],
  );

  const isMaster = !!lesson && lesson.lessonId === masterLesson.lessonId;
  const masterLocked = isMaster && !!lesson && !isMasterUnlocked(progress.completedLessons);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-md text-center">
        <Card>
          <EmptyArt className="mx-auto h-28 w-auto" />
          <p className="mt-2 text-lg font-black">That pebble rolled away</p>
          <p className="text-sm font-bold text-muted">Let's head back to the trail and pick another mission.</p>
          <Link to="/journey"><Button className="mt-3 w-full">Back to journey</Button></Link>
        </Card>
      </div>
    );
  }

  if (masterLocked) {
    return (
      <div className="mx-auto max-w-md text-center">
        <Card>
          <div className="flex justify-center"><TrophyArt size={84} /></div>
          <p className="mt-2 text-lg font-black">The finale is still sealed</p>
          <p className="text-sm font-bold text-muted">
            Clear all 12 missions first ({progress.completedLessons.length}/12 so far) — then the Final Showdown unlocks with fresh mixed questions.
          </p>
          <Link to="/journey"><Button className="mt-4 w-full">Back to the trail</Button></Link>
        </Card>
      </div>
    );
  }

  const chapter = chapterById(lesson.chapterId);
  const topic = topicById(lesson.topicId);
  const totalAuto = autoMarkableCount(lesson);
  const answeredAuto = Object.keys(mcq).length + Object.keys(tf).length;

  const result = resultId ? progress.attempts.find((a) => a.id === resultId) ?? null : null;

  const submit = () => {
    const saSelf: Record<string, number> = {};
    for (const s of lesson.shortAnswer) {
      const checked = saMarks[s.id] ?? [];
      saSelf[s.id] = checked.length;
    }
    const created = recordAttempt({
      lessonId: lesson.lessonId,
      mcqAnswers: mcq,
      tfAnswers: tf,
      shortAnswerSelfMarks: saSelf,
      challengeDone,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
    });
    setResultId(created.id);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const retry = () => {
    setMcq({});
    setTf({});
    setSaMarks({});
    setChallengeDone(false);
    setChallengeText("");
    setResultId(null);
    setStep(2);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/journey" className="inline-flex items-center gap-1.5 text-sm font-black text-muted hover:text-sky-700">
        <ArrowLeft size={15} strokeWidth={3} /> Trail
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="sky">{isMaster ? "Master Chapter" : chapter?.title}</Badge>
            <Badge tone="neutral">{isMaster ? "Capstone · pp. 1–130" : `Lesson ${lesson.topicId.replace("top-", "")} · pp. ${lesson.pages.start}–${lesson.pages.end}`}</Badge>
          </div>
          <h1 className="mt-1.5 text-3xl font-black tracking-tight text-ink">{lesson.title}</h1>
          <p className="mt-1 text-xs font-bold text-muted">
            {isMaster
              ? "Mixed capstone across Chapters 1–4 · fresh wording, new numbers"
              : <>Goals: {topic?.learningObjectives.map((o) => o.objectiveId).join(" · ")}</>}
            {prevAttempts.length > 0 && ` · ${prevAttempts.length} previous attempt${prevAttempts.length > 1 ? "s" : ""}, best ${Math.max(...prevAttempts.map((a) => a.scorePercent))}%`}
          </p>
        </div>
        {result && (
          <Badge tone={result.band === "progress" ? "mint" : result.band === "practice" ? "tang" : "coral"}>
            {result.scorePercent}% · {result.band}
          </Badge>
        )}
      </div>

      {/* stepper */}
      <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Lesson steps">
        {stepMeta.map((s, i) => {
          const active = i === step;
          const finished = resultId !== null || i < step;
          return (
            <button
              key={s.name}
              role="tab"
              aria-selected={active}
              onClick={() => { if (resultId || i < 3) setStep(i); }}
              className={cn(
                "duo-press flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-b-4 px-2 py-2.5 text-xs font-black sm:text-[13px]",
                active && "border-mint-500 bg-mint-400 text-white",
                !active && finished && "border-mint-400/50 bg-mint-100 text-mint-800",
                !active && !finished && "border-line bg-white text-faint",
              )}
            >
              <s.icon size={15} strokeWidth={3} /> {i + 1}. {s.name}
            </button>
          );
        })}
      </div>
      <ProgressBar value={step + 1} max={4} className="mt-2" />

      <AnimatePresence mode="wait">
        <motion.div key={step + lesson.lessonId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
          {step === 0 && (
            <div className="space-y-3">
              <Card className="border-sky-400/40 bg-sky-100/60">
                <PebbleMascot mood="reading" message={`Let's explore ${lesson.title.toLowerCase()} together — about ${lesson.estimatedMinutes} minutes. Read each card!`} />
              </Card>
              {lesson.learn.map((s, i) => (
                <Card key={i}>
                  <p className="flex items-center gap-1.5">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-400 text-xs font-black text-white">{i + 1}</span>
                    <span className="text-[11px] font-black tracking-[0.12em] text-sky-700 uppercase">Part {i + 1}</span>
                  </p>
                  <h3 className="mt-1 text-lg font-black text-ink">{s.heading}</h3>
                  <div className="reading mt-1.5 space-y-2.5">
                    {s.body.map((p, j) => <p key={j}><Gloss text={p} /></p>)}
                  </div>
                  {s.notebookPrompt && (
                    <div className="mt-3 flex gap-2.5 rounded-2xl border-2 border-sun-400/50 bg-sun-100/60 p-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sun-400 text-sun-700">
                        <NotebookPen size={18} strokeWidth={2.5} />
                      </span>
                      <p className="text-sm font-bold text-ink">
                        <span className="font-black text-sun-700">Notebook mission: </span><Gloss text={s.notebookPrompt} />
                      </p>
                    </div>
                  )}
                </Card>
              ))}
              <Card>
                <p className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.12em] text-muted uppercase">
                  <ListChecks size={14} strokeWidth={2.75} /> Key terms to keep
                </p>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {lesson.keyTerms.map((k) => (
                    <div key={k.term} className="rounded-2xl border-2 border-mint-400/30 bg-mint-50 px-3 py-2">
                      <p className="text-sm font-black text-mint-800">{k.term}</p>
                      <p className="reading !text-[13px] !leading-relaxed">{k.definition}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Button className="w-full text-base" onClick={() => { markFlashcardsSeen(lesson); setStep(1); window.scrollTo({ top: 0 }); }}>
                Got it — flip some cards <ArrowRight size={17} strokeWidth={3} />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <Card className="border-grape-400/40 bg-grape-100/50">
                <PebbleMascot mood="think" message="Tap a card to flip it. Say the answer out loud before peeking — that's how memories stick!" />
              </Card>
              {lesson.flashcards.length === 0 ? (
                <Card className="text-center">
                  <EmptyArt className="mx-auto h-24 w-auto" />
                  <p className="mt-1 font-black">No flashcards for this mission</p>
                  <p className="text-sm font-bold text-muted">Head straight to practise — the key terms above are your revision.</p>
                </Card>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {lesson.flashcards.map((f) => {
                    const isFlipped = !!flipped[f.id];
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFlipped((p) => ({ ...p, [f.id]: !p[f.id] }))}
                        aria-pressed={isFlipped}
                        aria-label={`Flashcard: ${f.front}. ${isFlipped ? `Answer: ${f.back}` : "Activate to reveal the answer."}`}
                        className="flip-scene h-48 cursor-pointer text-left"
                      >
                        <div className={`flip-inner ${isFlipped ? "flipped" : ""}`}>
                          <div className="flip-face grid place-items-center rounded-3xl border-2 border-sky-400/50 bg-white p-4 shadow-[0_4px_0_#ddf4ff]">
                            <div>
                              <p className="flex items-center gap-1 text-[11px] font-black tracking-[0.12em] text-sky-700 uppercase">
                                <Layers size={12} strokeWidth={3} /> Quiz me — tap to flip
                              </p>
                              <p className="mt-1.5 text-[15px] font-black text-ink"><Gloss text={f.front} /></p>
                            </div>
                          </div>
                          <div className="flip-face flip-back grid place-items-center rounded-3xl border-b-8 border-mint-500 bg-mint-400 p-4">
                            <div>
                              <p className="text-[11px] font-black tracking-[0.12em] text-white/85 uppercase">Answer</p>
                              <p className="reading mt-1 !text-white !text-sm font-semibold"><Gloss text={f.back} dark /></p>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {lesson.misconceptions.length > 0 && (
                <Card className="border-tang-400/50 bg-tang-100/50">
                  <p className="flex items-center gap-1.5 text-sm font-black text-tang-700">
                    <TriangleAlert size={16} strokeWidth={2.75} /> Trap alert — don't get caught!
                  </p>
                  {lesson.misconceptions.map((m) => (
                    <div key={m.id} className="mt-2 overflow-hidden rounded-2xl border-2 border-line bg-white text-sm">
                      <div className="flex items-start gap-2 border-b-2 border-dashed border-line bg-coral-100/50 p-3">
                        <CircleX size={17} strokeWidth={2.75} className="mt-0.5 shrink-0 text-coral-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black tracking-[0.14em] text-coral-700 uppercase">Myth</p>
                          <p className="font-bold text-ink"><Gloss text={m.misconception} /></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-mint-50/60 p-3">
                        <CircleCheck size={17} strokeWidth={2.75} className="mt-0.5 shrink-0 text-mint-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black tracking-[0.14em] text-mint-700 uppercase">Fact</p>
                          <p className="font-bold text-ink"><Gloss text={m.intervention} /></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
              <div className="flex gap-2">
                <Button variant="white" onClick={() => setStep(0)}><ArrowLeft size={15} strokeWidth={3} /> Learn</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>To practise <ArrowRight size={16} strokeWidth={3} /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Card className="border-mint-400/40 bg-mint-50">
                <PebbleMascot mood="cheer" message="Showtime! Answer everything — replays are free and Pebble loves a comeback." />
              </Card>

              {lesson.mcqs.map((q, qi) => (
                <Card key={q.id}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="sky">Q{qi + 1} · Pick one</Badge>
                    <span className="text-[11px] font-black text-faint uppercase">{q.difficulty} · {q.objectiveId}</span>
                  </div>
                  <p className="mt-1.5 text-[15px] font-black text-ink">{q.question}</p>
                  <div className="mt-2.5 grid gap-2">
                    {(Object.keys(q.options) as ("A" | "B" | "C" | "D")[]).map((k) => {
                      const selected = mcq[q.id] === k;
                      return (
                        <button
                          key={k}
                          onClick={() => setMcq((p) => ({ ...p, [q.id]: k }))}
                          aria-pressed={selected}
                          className={cn(
                            "duo-press flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-sm font-bold transition",
                            selected
                              ? "border-sky-400 bg-sky-100 text-sky-700 shadow-[0_3px_0_#b8e6ff]"
                              : "border-line bg-white text-ink hover:border-sky-400/60 hover:bg-sky-100/40",
                          )}
                        >
                          <span className={cn(
                            "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-black",
                            selected ? "border-sky-500 bg-sky-400 text-white" : "border-line bg-stage text-muted",
                          )}>{k}</span>
                          {q.options[k]}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              ))}

              {lesson.trueFalse.map((q, qi) => (
                <Card key={q.id}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="grape">Q{lesson.mcqs.length + qi + 1} · True or false?</Badge>
                    <span className="text-[11px] font-black text-faint uppercase">{q.objectiveId}</span>
                  </div>
                  <p className="mt-1.5 text-[15px] font-black text-ink">{q.statement}</p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    {[true, false].map((v) => {
                      const selected = tf[q.id] === v;
                      return (
                        <button
                          key={String(v)}
                          onClick={() => setTf((p) => ({ ...p, [q.id]: v }))}
                          aria-pressed={selected}
                          className={cn(
                            "duo-press cursor-pointer rounded-2xl border-2 px-3 py-3 text-[15px] font-black transition",
                            selected
                              ? "border-sky-400 bg-sky-100 text-sky-700 shadow-[0_3px_0_#b8e6ff]"
                              : "border-line bg-white text-ink hover:border-sky-400/60",
                          )}
                        >
                          {v ? "True" : "False"}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              ))}

              {lesson.shortAnswer.map((s) => (
                <Card key={s.id} className="border-dashed border-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="tang"><PenLine size={12} strokeWidth={3} /> Write it · {s.rubric.totalMarks} marks</Badge>
                    <span className="text-[11px] font-black text-faint uppercase">{s.objectiveId}</span>
                  </div>
                  <p className="mt-1.5 text-[15px] font-black text-ink">{s.question}</p>
                  <textarea
                    rows={3}
                    placeholder="Write your answer here (kept on this device)…"
                    aria-label={`Your answer for: ${s.question}`}
                    className="reading mt-2 w-full rounded-2xl border-2 border-line bg-stage px-3 py-2 !text-sm outline-none placeholder:text-faint focus:border-mint-400"
                    onChange={() => {}}
                  />
                  <p className="mt-2.5 text-[11px] font-black tracking-[0.12em] text-muted uppercase">Tick each rubric point you covered:</p>
                  <div className="mt-1.5 space-y-1.5">
                    {s.rubric.criteria.map((c, ci) => {
                      const checked = (saMarks[s.id] ?? []).includes(ci);
                      return (
                        <button
                          key={ci}
                          onClick={() => setSaMarks((p) => {
                            const cur = p[s.id] ?? [];
                            return { ...p, [s.id]: checked ? cur.filter((x) => x !== ci) : [...cur, ci] };
                          })}
                          aria-pressed={checked}
                          className={cn(
                            "flex w-full cursor-pointer items-start gap-2.5 rounded-2xl border-2 px-3 py-2.5 text-left text-[13px] font-bold",
                            checked ? "border-mint-400 bg-mint-50 text-mint-800" : "border-line bg-white text-ink",
                          )}
                        >
                          <span className={cn(
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                            checked ? "border-mint-500 bg-mint-400 text-white" : "border-line-strong text-transparent",
                          )}>
                            <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.5l2.6 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </span>
                          (+{c.mark}) {c.description}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              ))}

              <Card className="overflow-hidden !p-0">
                <div className="flex items-center gap-2.5 bg-grape-100 px-5 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-grape-400 text-white">
                    <BriefcaseBusiness size={20} strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="text-[11px] font-black tracking-[0.12em] text-grape-700 uppercase">Boss-level scenario · {lesson.challenge.challengeId}</p>
                    <p className="text-lg leading-tight font-black text-ink">{lesson.challenge.title}</p>
                  </div>
                </div>
                <div className="space-y-1.5 p-5">
                  <p className="reading !text-sm"><Gloss text={lesson.challenge.context} /></p>
                  <p className="text-sm font-black text-ink">Your task: <Gloss text={lesson.challenge.task} /></p>
                  <textarea
                    rows={3}
                    value={challengeText}
                    onChange={(e) => setChallengeText(e.target.value)}
                    placeholder="Type your recommendation or analysis here…"
                    aria-label="Your answer to the business scenario"
                    className="reading mt-1 w-full rounded-2xl border-2 border-line bg-stage px-3 py-2 !text-sm outline-none placeholder:text-faint focus:border-grape-400"
                  />
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border-2 border-line px-3 py-2.5 text-sm font-black text-ink">
                    <input type="checkbox" checked={challengeDone} onChange={(e) => setChallengeDone(e.target.checked)} className="h-5 w-5 accent-[#58cc02]" />
                    I attempted the scenario (honest Pebble promise)
                  </label>
                </div>
              </Card>

              <div className="flex gap-2">
                <Button variant="white" onClick={() => setStep(1)}><ArrowLeft size={15} strokeWidth={3} /> Review</Button>
                <Button variant="blue" className="flex-1 text-base" disabled={totalAuto > 0 && answeredAuto < totalAuto} onClick={submit}>
                  {totalAuto > 0 && answeredAuto < totalAuto
                    ? `Answer all ${totalAuto} quick questions (${answeredAuto}/${totalAuto})`
                    : <>See my results <PartyPopper size={17} strokeWidth={2.5} /></>}
                </Button>
              </div>
              {totalAuto === 0 && <p className="text-center text-xs font-bold text-muted">This mission has no auto-marked questions — your written work still earns XP.</p>}
            </div>
          )}

          {step === 3 && result && (
            <ResultsPanel
              lessonId={lesson.lessonId}
              attemptId={result.id}
              onRetry={retry}
              onNext={() => nav("/dashboard")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ResultsPanel({ lessonId, attemptId, onRetry, onNext }: { lessonId: string; attemptId: string; onRetry: () => void; onNext: () => void }) {
  const { progress } = useProgress();
  const lesson = lessonById(lessonId)!;
  const attempt = progress.attempts.find((a) => a.id === attemptId)!;
  const band = bandFor(attempt.scorePercent);

  const headline =
    band === "progress"
      ? "Path cleared — superstar!"
      : band === "practice"
        ? "Good stepping — polish it up"
        : "Revision lap, then retry!";

  const revisionTip =
    band === "progress"
      ? "Roll on to the next mission tomorrow. Replay these notes in a week to lock them in."
      : band === "practice"
        ? "Re-read the Learn cards, flip the flashcards once more, then retry this quiz."
        : "Go back to Learn, read slowly, finish one notebook mission, then retry. Small steps win!";

  return (
    <div className="space-y-3">
      <Card className="relative overflow-hidden text-center">
        <ConfettiBurst />
        <div className="flex justify-center">
          <PebbleMascot mood={band === "progress" ? "star" : band === "practice" ? "happy" : "sad"} size={104} />
        </div>
        <p className="mt-1 text-2xl font-black text-ink">{headline}</p>
        <div className="mt-2 flex justify-center"><ScoreRing pct={attempt.scorePercent} /></div>
        <p className="mt-1 text-sm font-black text-ink">
          {attempt.autoCorrect}/{attempt.autoTotal} correct · +{attempt.xpEarned} XP
        </p>
        <div className="mx-auto mt-2 flex max-w-sm flex-wrap justify-center gap-1.5">
          <Badge tone={band === "progress" ? "mint" : band === "practice" ? "tang" : "coral"}>
            <PartyPopper size={12} strokeWidth={3} /> {band === "progress" ? "Mission clear!" : band === "practice" ? "Practise more" : "Guided revision"}
          </Badge>
          {attempt.challengeDone && <Badge tone="grape"><BriefcaseBusiness size={12} strokeWidth={3} /> Scenario attempted</Badge>}
        </div>
      </Card>

      <Card>
        <p className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.12em] text-muted uppercase">
          <ListChecks size={14} strokeWidth={2.75} /> Answers & coach notes
        </p>
        <div className="mt-2 space-y-2.5">
          {lesson.mcqs.map((q) => {
            const picked = (attempt.mcqAnswers[q.id] ?? "").toUpperCase();
            const ok = picked === q.correctAnswer;
            return (
              <div key={q.id} className={cn("rounded-2xl border-2 p-3", ok ? "border-mint-400/60 bg-mint-50" : "border-coral-400/60 bg-coral-100/40")}>
                <p className="flex items-start gap-1.5 text-sm font-black text-ink">
                  {ok ? <CircleCheck size={17} strokeWidth={2.75} className="mt-0.5 shrink-0 text-mint-500" /> : <CircleX size={17} strokeWidth={2.75} className="mt-0.5 shrink-0 text-coral-500" />}
                  {q.question}
                </p>
                <p className="mt-1 text-xs font-black">You: {picked ? `${picked} — ${q.options[picked as "A" | "B" | "C" | "D"]}` : "no answer"} · Correct: {q.correctAnswer} — {q.options[q.correctAnswer]}</p>
                <div className="mt-1 flex items-start gap-1 text-xs font-bold text-muted">
                  <Lightbulb size={13} strokeWidth={2.75} className="mt-0.5 shrink-0 text-sun-500" /><p className="min-w-0 flex-1"><Gloss text={q.explanation} /></p>
                </div>
              </div>
            );
          })}
          {lesson.trueFalse.map((q) => {
            const picked = attempt.tfAnswers[q.id];
            const ok = picked === q.correctAnswer;
            return (
              <div key={q.id} className={cn("rounded-2xl border-2 p-3", ok ? "border-mint-400/60 bg-mint-50" : "border-coral-400/60 bg-coral-100/40")}>
                <p className="flex items-start gap-1.5 text-sm font-black text-ink">
                  {ok ? <CircleCheck size={17} strokeWidth={2.75} className="mt-0.5 shrink-0 text-mint-500" /> : <CircleX size={17} strokeWidth={2.75} className="mt-0.5 shrink-0 text-coral-500" />}
                  {q.statement}
                </p>
                <p className="mt-1 text-xs font-black">You: {picked === undefined ? "no answer" : String(picked)} · Correct: {String(q.correctAnswer)}</p>
                <div className="mt-1 flex items-start gap-1 text-xs font-bold text-muted">
                  <Lightbulb size={13} strokeWidth={2.75} className="mt-0.5 shrink-0 text-sun-500" /><p className="min-w-0 flex-1"><Gloss text={q.explanation} /></p>
                </div>
              </div>
            );
          })}
          {lesson.mcqs.length + lesson.trueFalse.length === 0 && (
            <p className="text-sm font-bold text-muted">No auto-marked questions in this mission — XP awarded for your written and scenario effort.</p>
          )}
        </div>
      </Card>

      <Card className="border-sky-400/40 bg-sky-100/50">
        <p className="text-sm font-black text-sky-700">Coach Pebble's next step</p>
        <p className="reading mt-1 !text-sm">{revisionTip}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="white" onClick={onRetry}><RotateCcw size={15} strokeWidth={3} /> Replay mission</Button>
          <Button onClick={onNext}>Back to base <ArrowRight size={15} strokeWidth={3} /></Button>
          <Link to="/journey" className="inline-flex items-center rounded-2xl px-3 py-2 text-sm font-black text-sky-700 hover:bg-sky-100">Trail</Link>
        </div>
      </Card>
    </div>
  );
}
