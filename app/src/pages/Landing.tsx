import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Layers,
  PenLine,
  Trophy,
  Users,
  Clock3,
  RotateCcw,
  Zap,
} from "lucide-react";
import PebbleMascot from "../components/PebbleMascot";
import { Button, Card, Badge } from "../components/ui";
import { ChapterArt } from "../components/art";
import { chapters, lessons } from "../data/curriculum";
import { useProgress } from "../lib/store";

const chapterStyles: Record<string, { band: string; chip: string; bar: string }> = {
  "ch-01": { band: "bg-mint-100", chip: "bg-mint-400", bar: "bg-mint-400" },
  "ch-02": { band: "bg-sky-100", chip: "bg-sky-400", bar: "bg-sky-400" },
  "ch-03": { band: "bg-tang-100", chip: "bg-tang-400", bar: "bg-tang-400" },
  "ch-04": { band: "bg-grape-100", chip: "bg-grape-400", bar: "bg-grape-400" },
};

const flowSteps = [
  { icon: BookOpenText, tint: "bg-mint-100 text-mint-700", title: "Learn", body: "Friendly notes, key terms & notebook prompts" },
  { icon: Layers, tint: "bg-sky-100 text-sky-700", title: "Review", body: "Flip flashcards & bust tricky misconceptions" },
  { icon: PenLine, tint: "bg-tang-100 text-tang-700", title: "Practise", body: "Quizzes, true/false & real business scenarios" },
  { icon: Trophy, tint: "bg-sun-100 text-sun-700", title: "Shine", body: "XP, streaks, medals & milestones" },
];

export default function Landing() {
  const { isLoggedIn, progress, todayLesson } = useProgress();

  return (
    <div className="space-y-8">
      {/* hero */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="dot-grid relative overflow-hidden rounded-[2rem] border-b-8 border-sky-500 bg-sky-400 px-6 pt-8 pb-6 sm:px-10"
      >
        <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <Badge tone="sun" className="border-2 bg-white text-sun-700">
              <Zap size={13} strokeWidth={3} /> Grade 7 · Business Studies
            </Badge>
            <h1 className="mt-3 text-4xl leading-[1.02] font-black text-white drop-shadow-[0_2px_0_rgba(11,111,164,.45)] sm:text-5xl">
              Small steps,
              <br />
              big business brains.
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed font-bold text-white/95">
              Pebble turns <em>Exploring Business Studies 7</em> into one playful daily mission:
              learn, flip, practise and grow your streak — while parents follow the real progress.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button variant="sun" className="text-base">
                    Continue learning <ArrowRight size={17} strokeWidth={3} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/start">
                    <Button variant="sun" className="text-base">
                      Start learning <ArrowRight size={17} strokeWidth={3} />
                    </Button>
                  </Link>
                  <Link to="/parent">
                    <Button variant="white">
                      <Users size={16} strokeWidth={2.75} /> Parent area
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { n: "12", l: "daily missions" },
                { n: "4", l: "chapters · pp. 1–130" },
                { n: "30+", l: "questions & tasks" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border-2 border-white/50 bg-white/20 px-4 py-2 text-center backdrop-blur-[1px]">
                  <p className="text-xl leading-none font-black text-white">{s.n}</p>
                  <p className="text-[11px] font-black tracking-wide text-white/90 uppercase">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm rounded-3xl border-2 border-white/60 bg-white/25 p-4">
            <PebbleMascot
              mood="cheer"
              size={120}
              message={
                isLoggedIn
                  ? `Welcome back, ${progress.userName}! Today's mission: ${todayLesson.title} (pp. ${todayLesson.pages.start}–${todayLesson.pages.end}).`
                  : "Hi, I'm Pebble! I'll coach you through one mission a day. Ready to roll?"
              }
            />
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/85 px-3 py-2 text-xs font-extrabold text-ink">
              <Clock3 size={15} strokeWidth={2.75} className="shrink-0 text-sky-700" />
              About 20 minutes a day · retry anything, anytime
            </div>
          </div>
        </div>
      </motion.section>

      {/* how it works */}
      <section>
        <h2 className="text-xl font-black text-ink">How a mission works</h2>
        <p className="text-sm font-bold text-muted">A guided loop, Khan-style — coach, practise, master.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {flowSteps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-lift relative h-full pt-5">
                <span className="absolute -top-3 left-4 grid h-7 w-7 place-items-center rounded-full border-b-4 border-mint-500 bg-mint-400 text-sm font-black text-white">
                  {i + 1}
                </span>
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${s.tint}`}>
                  <s.icon size={22} strokeWidth={2.5} />
                </span>
                <p className="mt-2 text-base font-black">{s.title}</p>
                <p className="text-[13px] leading-snug font-bold text-muted">{s.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border-2 border-line bg-white px-4 py-2.5 text-[13px] font-bold text-muted">
          <RotateCcw size={15} strokeWidth={2.75} className="shrink-0 text-mint-500" />
          Scoring guide: 80–100% clears the path · 50–79% unlocks extra practise · below 50% gets a guided revision lap, then a retry.
        </div>
      </section>

      {/* chapters */}
      <section>
        <h2 className="text-xl font-black text-ink">Four worlds to explore</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {chapters.map((c) => {
            const st = chapterStyles[c.chapterId];
            const chLessons = lessons.filter((l) => l.chapterId === c.chapterId);
            return (
              <div key={c.chapterId} className="card-lift overflow-hidden rounded-3xl border-2 border-line bg-white">
                <div className={`${st.band} px-5 pt-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className={`inline-block max-w-full overflow-hidden text-ellipsis rounded-full px-2.5 py-0.5 text-[11px] font-black tracking-wider whitespace-nowrap text-white uppercase ${st.chip}`}>
                        World {c.chapterNumber} · pp. {c.pages.start}–{c.pages.end}
                      </span>
                      <p className="mt-1.5 text-lg leading-tight font-black text-ink">{c.title}</p>
                      <p className="mt-0.5 text-xs font-bold text-muted">{chLessons.length} missions</p>
                    </div>
                    <ChapterArt chapterId={c.chapterId} className="h-20 w-32 shrink-0" />
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/70">
                    <div className={`h-full rounded-full ${st.bar}`} style={{ width: "0%" }} />
                  </div>
                  <p className="py-1.5 text-[11px] font-bold text-muted">{chLessons.map((l) => l.title).join(" · ")}</p>
                </div>
                <div className="flex items-center justify-between gap-2 px-5 py-3">
                  <span className="text-xs font-black text-muted">{chLessons.length} lessons · flashcards · scenarios</span>
                  <Link to="/journey">
                    <Button variant="blue" className="px-4 py-2 text-[13px]">
                      Explore <ArrowRight size={14} strokeWidth={3} />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
