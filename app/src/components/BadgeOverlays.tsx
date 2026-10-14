import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, PartyPopper } from "lucide-react";
import { AchievementBadge, ConfettiBurst, badgeMeta } from "./art";
import { Button, Badge } from "./ui";
import { useProgress } from "../lib/store";
import { cn } from "./ui";

/* ─── Badge reward moments ───────────────────────────────────────────────────
   CelebrationOverlay: pops whenever fresh badges are earned (after quizzes,
   streaks, showdowns). BadgeSpotlight: fullscreen detail view opened by
   tapping any badge across the app.
----------------------------------------------------------------------------- */

export function CelebrationOverlay() {
  const { celebration, advanceCelebration, dismissCelebration } = useProgress();
  const [spotId, setSpotId] = useState<string | null>(null);
  const current = celebration[0] ?? null;
  const meta = current ? badgeMeta(current) : undefined;

  useEffect(() => {
    if (!current) setSpotId(null);
  }, [current]);

  return (
    <>
      <AnimatePresence>
        {current && meta && !spotId && (
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm"
            onClick={advanceCelebration}
            role="dialog"
            aria-modal="true"
            aria-label={`You earned the ${meta.title} badge`}
          >
            <motion.div
              initial={{ scale: 0.6, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.7, y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white p-6 pt-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ConfettiBurst pieces={22} />
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-black tracking-[0.2em] text-sun-500 uppercase">
                <PartyPopper size={14} strokeWidth={2.75} /> Badge unlocked
                {celebration.length > 1 && <span className="text-muted">· 1 of {celebration.length}</span>}
              </p>
              <button
                onClick={() => setSpotId(current)}
                className="mx-auto mt-3 block cursor-pointer rounded-full transition hover:scale-105"
                aria-label={`Admire the ${meta.title} badge up close`}
              >
                <motion.div
                  initial={{ scale: 0.4, rotate: -14 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
                >
                  <AchievementBadge id={current} size={132} earned />
                </motion.div>
              </button>
              <h2 className="mt-2 text-2xl font-black text-ink">{meta.title}</h2>
              <p className="mx-auto mt-1 max-w-[26ch] text-sm font-bold text-muted">{meta.detail}</p>
              <div className="mt-2 flex justify-center">
                <Badge tone="sun">+{meta.xp} XP banked</Badge>
              </div>
              <div className="mt-4 grid gap-2">
                <Button onClick={advanceCelebration} className="w-full text-base">
                  {celebration.length > 1 ? "Next!" : "Keep rolling!"}
                </Button>
                <button onClick={dismissCelebration} className="cursor-pointer text-xs font-black text-faint hover:text-muted">
                  {celebration.length > 1 ? "Collect all at once" : "Admire later in Achievements"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {spotId && <BadgeSpotlight id={spotId} earned onClose={() => setSpotId(null)} />}
    </>
  );
}

export function BadgeSpotlight({
  id,
  earned,
  onClose,
}: {
  id: string;
  earned: boolean;
  onClose: () => void;
}) {
  const meta = badgeMeta(id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!meta) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/85 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${meta.title} badge, ${earned ? "unlocked" : "locked"}`}
    >
      <button
        onClick={onClose}
        aria-label="Close badge view"
        className="fixed top-4 right-4 z-10 grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
      >
        <X size={20} strokeWidth={3} />
      </button>
      <div
        className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center justify-center py-10 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0.55, y: 60, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 19 }}
          className="relative"
        >
          {earned && <ConfettiBurst pieces={16} />}
          <div className="animate-floaty">
            <AchievementBadge id={id} size={176} earned={earned} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <h2 className="mt-4 text-3xl font-black text-white">{meta.title}</h2>
          <p className="mx-auto mt-2 max-w-[30ch] text-[15px] leading-relaxed font-bold text-white/80">
            {meta.detail}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-sun-400 px-3 py-1 text-sm font-black text-[#5c3d00]">
              +{meta.xp} XP
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black",
                earned ? "bg-mint-400 text-white" : "bg-white/15 text-white/80",
              )}
            >
              {!earned && <Lock size={13} strokeWidth={3} />}
              {earned ? "Unlocked" : "Locked"}
            </span>
          </div>
          {!earned && (
            <p className="mx-auto mt-3 max-w-[30ch] text-[13px] font-bold text-white/60">
              Keep learning — this medal lands in your cabinet the moment you meet its challenge.
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
