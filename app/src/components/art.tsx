import type { ReactNode } from "react";
import { useId } from "react";
import {
  Sprout,
  Calculator,
  Rocket,
  Crown,
  Globe,
  Scale,
  Gauge,
  Building2,
  RotateCcw,
  Swords,
  Trophy,
  Lock,
} from "lucide-react";
import { cn } from "./ui";
import worldMarket from "../assets/illustrations/world-market.svg";
import worldFinance from "../assets/illustrations/world-finance.svg";
import worldShip from "../assets/illustrations/world-ship.svg";
import worldDeal from "../assets/illustrations/world-deal.svg";

/* ─── Pebble illustration system ─────────────────────────────────────────────
   World scenes: unDraw illustrations (https://undraw.co, free for commercial
   use), vendored via the MIT-licensed `react-undraw-illustrations` package
   and tinted to each world's palette. Credit in README.
   Small decorative icons (flame, bolt, trophy, medals) stay hand-drawn SVG;
   functional UI icons stay Lucide.
----------------------------------------------------------------------------- */

/* Streak flame */
export function FlameArt({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2c1 3-2 4.5-2 7a4.5 4.5 0 0 0 9 .5C19 6 14 4.5 12 2Z"
        fill="#ff9600"
      />
      <path
        d="M12 8c.6 1.8-1.2 2.7-1.2 4.2a2.7 2.7 0 0 0 5.4.3C16.2 10.4 13.6 9.6 12 8Z"
        fill="#ffc800"
      />
      <path d="M9.5 13.5A4.5 4.5 0 0 0 14 18a4.5 4.5 0 0 0 1-8.9c-.6 1.2-.8 2.8.5 4.4Z" fill="#ff6b6b" opacity=".9" />
      <ellipse cx="11" cy="16.4" rx="1.6" ry="2.1" fill="#fff3c4" />
    </svg>
  );
}

/* XP lightning bolt */
export function BoltArt({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M13.5 1.5 4.5 13.5h5L9 22.5 19.5 10h-5.5l-.5-8.5Z"
        fill="#ffc800"
        stroke="#e0a800"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12.6 4.5 7 12h3.4l-.4 5.4 5-6.6h-3.2l.8-6.3Z" fill="#ffde59" />
    </svg>
  );
}

/* Trophy cup */
export function TrophyArt({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label="Trophy">
      <ellipse cx="48" cy="86" rx="26" ry="6" fill="#e8ddc4" />
      <path d="M28 22h40v8c0 14-8 24-18 24h-4c-10 0-18-10-18-24v-8Z" fill="#ffc800" stroke="#e0a800" strokeWidth="3" />
      <path d="M28 26H16c0 12 6 20 16 22M68 26h12c0 12-6 20-16 22" fill="none" stroke="#e0a800" strokeWidth="5" strokeLinecap="round" />
      <rect x="43" y="54" width="10" height="12" rx="3" fill="#e0a800" />
      <rect x="32" y="66" width="32" height="10" rx="5" fill="#ff9600" />
      <rect x="28" y="76" width="40" height="8" rx="4" fill="#1cb0f6" />
      <circle cx="48" cy="36" r="7" fill="#ffde59" stroke="#e0a800" strokeWidth="2.5" />
      <path d="M48 31l1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5L48 31Z" fill="#e0a800" />
    </svg>
  );
}

/* Medal with ribbon + Lucide/custom icon slot */
const medalTones: Record<string, { ring: string; face: string; ribbon: string }> = {
  sun: { ring: "#e0a800", face: "#ffc800", ribbon: "#1cb0f6" },
  mint: { ring: "#46a302", face: "#58cc02", ribbon: "#ff9600" },
  sky: { ring: "#1899d6", face: "#1cb0f6", ribbon: "#ff6b6b" },
  coral: { ring: "#e54848", face: "#ff6b6b", ribbon: "#ffc800" },
  grape: { ring: "#8548e0", face: "#a560ff", ribbon: "#58cc02" },
  tang: { ring: "#d97a00", face: "#ff9600", ribbon: "#1cb0f6" },
};

export function Medal({
  tone = "sun",
  icon,
  size = 64,
  dimmed = false,
}: {
  tone?: keyof typeof medalTones | string;
  icon: ReactNode;
  size?: number;
  dimmed?: boolean;
}) {
  const t = medalTones[tone] ?? medalTones.sun;
  return (
    <div
      className={cn("relative grid shrink-0 place-items-center", dimmed && "opacity-40 grayscale")}
      style={{ width: size, height: size + 14 }}
      aria-hidden
    >
      <svg viewBox="0 0 64 78" width={size} height={size + 14}>
        <path d="M22 0h20l-4 26H26L22 0Z" fill={t.ribbon} opacity=".85" />
        <path d="M22 0l8 14L14 4M42 0l-8 14 16-10" fill={t.ribbon} />
        <circle cx="32" cy="48" r="26" fill={t.face} stroke={t.ring} strokeWidth="4" />
        <circle cx="32" cy="48" r="19" fill="rgba(255,255,255,.28)" />
      </svg>
      <span className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-sm">
        {icon}
      </span>
    </div>
  );
}

/* ─── Achievement badges (Duolingo-style) ────────────────────────────────────
   Every badge has its own identity: unique glyph, tier colours, chunky ring,
   ribbon tails and gloss. Locked badges render as grey silhouettes with a
   padlock chip. `id` is the milestone/badge id from the curriculum data.
----------------------------------------------------------------------------- */

interface BadgeTheme {
  face: string;
  ring: string;
  ribbon: string;
  glyphColor: string;
  Glyph: (p: { size?: number }) => ReactNode;
}

const badgeThemes: Record<string, BadgeTheme> = {
  "ms-01": { face: "#ffc800", ring: "#c98f00", ribbon: "#1cb0f6", glyphColor: "#7a4a00", Glyph: (p) => <Sprout size={p.size} strokeWidth={2.6} /> },
  "ms-02": { face: "#1cb0f6", ring: "#0f7cb8", ribbon: "#ff6b6b", glyphColor: "#ffffff", Glyph: (p) => <Calculator size={p.size} strokeWidth={2.6} /> },
  "ms-03": { face: "#ff9600", ring: "#b25f00", ribbon: "#1cb0f6", glyphColor: "#ffffff", Glyph: (p) => <Rocket size={p.size} strokeWidth={2.6} /> },
  "ms-04": { face: "#a560ff", ring: "#6b32c4", ribbon: "#ffc800", glyphColor: "#ffffff", Glyph: (p) => <Crown size={p.size} strokeWidth={2.6} /> },
  "bdg-island-economist": { face: "#ff6b6b", ring: "#b23a3a", ribbon: "#ffc800", glyphColor: "#ffffff", Glyph: (p) => <Globe size={p.size} strokeWidth={2.6} /> },
  "bdg-flawless-balance": { face: "#1cb0f6", ring: "#0f7cb8", ribbon: "#58cc02", glyphColor: "#ffffff", Glyph: (p) => <Scale size={p.size} strokeWidth={2.6} /> },
  "bdg-productivity-pro": { face: "#58cc02", ring: "#377e00", ribbon: "#ff9600", glyphColor: "#ffffff", Glyph: (p) => <Gauge size={p.size} strokeWidth={2.6} /> },
  "bdg-corporate-architect": { face: "#a560ff", ring: "#6b32c4", ribbon: "#58cc02", glyphColor: "#ffffff", Glyph: (p) => <Building2 size={p.size} strokeWidth={2.6} /> },
  "bdg-streak-3": { face: "#ffc800", ring: "#c98f00", ribbon: "#ff6b6b", glyphColor: "#7a4a00", Glyph: (p) => <FlameArt size={p.size} /> },
  "bdg-streak-7": { face: "#ff9600", ring: "#b25f00", ribbon: "#ff6b6b", glyphColor: "#ffffff", Glyph: (p) => <FlameArt size={p.size} /> },
  "bdg-comeback": { face: "#58cc02", ring: "#377e00", ribbon: "#1cb0f6", glyphColor: "#ffffff", Glyph: (p) => <RotateCcw size={p.size} strokeWidth={2.6} /> },
  "bdg-reviser": { face: "#a560ff", ring: "#6b32c4", ribbon: "#ff9600", glyphColor: "#ffffff", Glyph: (p) => <Swords size={p.size} strokeWidth={2.6} /> },
  "bdg-capstone": { face: "#ffc800", ring: "#c98f00", ribbon: "#ff6b6b", glyphColor: "#7a4a00", Glyph: (p) => <Trophy size={p.size} strokeWidth={2.6} /> },
};

const fallbackTheme: BadgeTheme = {
  face: "#ffc800", ring: "#c98f00", ribbon: "#1cb0f6", glyphColor: "#7a4a00",
  Glyph: (p) => <Trophy size={p.size} strokeWidth={2.6} />,
};

export function AchievementBadge({
  id,
  size = 56,
  earned = true,
  className,
}: {
  id: string;
  size?: number;
  earned?: boolean;
  className?: string;
}) {
  const t = badgeThemes[id] ?? fallbackTheme;
  const gid = useId();
  const g = Math.round(size * 0.36);
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size + 14 }}
      aria-hidden
    >
      <svg
        viewBox="0 0 64 78"
        width={size}
        height={size + 14}
        className={cn(!earned && "opacity-60 grayscale")}
      >
        <defs>
          <radialGradient id={gid} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {earned && <ellipse cx="32" cy="74" rx="19" ry="2.6" fill="rgba(60,60,60,.14)" />}
        <path d="M26 2 L20 30 L26 27 L31 32 L31 2 Z" fill={t.ribbon} opacity=".92" />
        <path d="M38 2 L44 30 L38 27 L33 32 L33 2 Z" fill={t.ribbon} opacity=".92" />
        <circle cx="32" cy="48" r="24" fill={t.face} stroke={t.ring} strokeWidth="5" />
        <circle cx="32" cy="48" r="24" fill={`url(#${gid})`} />
        <circle cx="32" cy="48" r="18" fill="none" stroke="#ffffff" strokeOpacity=".4" strokeWidth="2" />
        <ellipse cx="25" cy="40" rx="8" ry="4" fill="#ffffff" opacity=".35" transform="rotate(-24 25 40)" />
      </svg>
      <span
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: "61.5%", color: earned ? t.glyphColor : "#8a8a8a", filter: earned ? "drop-shadow(0 2px 0 rgba(0,0,0,.25))" : undefined }}
      >
        <t.Glyph size={g} />
      </span>
      {!earned && (
        <span
          className="absolute grid place-items-center rounded-full border-2 border-white bg-[#3c3c3c] text-white shadow-md"
          style={{ width: size * 0.32, height: size * 0.32, top: "70%", left: "64%" }}
        >
          <Lock size={Math.max(10, Math.round(size * 0.16))} strokeWidth={3} />
        </span>
      )}
    </div>
  );
}

/* Chapter scenes — unDraw illustrations, one per world (see header credit) */
const worldScenes: Record<string, { src: string; label: string }> = {
  "ch-01": { src: worldMarket, label: "Browsing an island market stall" },
  "ch-02": { src: worldFinance, label: "Reviewing accounts and finance charts" },
  "ch-03": { src: worldShip, label: "A container ship at the harbour" },
  "ch-04": { src: worldDeal, label: "Two founders shaking hands on a deal" },
};

export function ChapterArt({ chapterId, className }: { chapterId: string; className?: string }) {
  const scene = worldScenes[chapterId] ?? worldScenes["ch-01"];
  return (
    <img
      src={scene.src}
      alt=""
      role="presentation"
      aria-hidden
      draggable={false}
      className={cn("object-contain select-none", className)}
    />
  );
}

/* Rolling-hills empty state landscape */
export function EmptyArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 110" className={className} role="img" aria-label="Empty landscape illustration">
      <circle cx="160" cy="24" r="15" fill="#ffc800" stroke="#e0a800" strokeWidth="3" />
      <ellipse cx="52" cy="24" rx="18" ry="8" fill="#fff" stroke="#e5e0d5" strokeWidth="2.5" />
      <path d="M0 70Q50 48 100 66T200 62V110H0V70Z" fill="#d7ffb8" stroke="#46a302" strokeWidth="3" />
      <path d="M0 84Q60 66 120 80T200 78V110H0V84Z" fill="#8fd14f" opacity=".55" />
      <rect x="96" y="40" width="4" height="26" fill="#9a6b3f" />
      <path d="M100 40l26 8-26 8v-16Z" fill="#ff6b6b" stroke="#e54848" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="40" cy="80" r="5" fill="#fff" stroke="#d8d2c2" strokeWidth="2.5" />
      <circle cx="56" cy="84" r="7" fill="#fff" stroke="#d8d2c2" strokeWidth="2.5" />
    </svg>
  );
}

/* Confetti burst for results */
const CONFETTI = ["#ffc800", "#58cc02", "#1cb0f6", "#ff6b6b", "#a560ff", "#ff9600"];
export function ConfettiBurst({ pieces = 18 }: { pieces?: number }) {
  const items = Array.from({ length: pieces }, (_, i) => {
    const left = (i * 97) % 100;
    const delay = ((i * 37) % 60) / 100;
    const color = CONFETTI[i % CONFETTI.length];
    const round = i % 3 === 0;
    return { left, delay, color, round, i };
  });
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 overflow-visible" aria-hidden>
      {items.map((p) => (
        <span
          key={p.i}
          className={p.round ? "absolute h-2.5 w-2.5 rounded-full" : "absolute h-2 w-3.5 rounded-[2px]"}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animation: `confetti-fall 1.4s ease-in ${p.delay}s both`,
          }}
        />
      ))}
    </div>
  );
}

/* Winding-path node (Duolingo-style lesson bubble) */
export function PathNode({
  state,
  icon,
  label,
  sub,
  onClick,
  ringClass,
}: {
  state: "done" | "current" | "todo";
  icon: ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
  ringClass?: string;
}) {
  const face =
    state === "done"
      ? "bg-sun-400 border-sun-500 shadow-[0_6px_0_#e0a800]"
      : state === "current"
        ? "bg-mint-400 border-mint-500 shadow-[0_6px_0_#46a302]"
        : "bg-[#e8e3d6] border-[#cfc8b4] shadow-[0_6px_0_#cfc8b4]";
  return (
    <button
      onClick={onClick}
      aria-label={`${label}${sub ? `, ${sub}` : ""}${state === "done" ? ", completed" : state === "current" ? ", up next" : ""}`}
      className={cn(
        "duo-press group flex w-full items-center gap-3 rounded-3xl border-2 border-line bg-white p-2.5 text-left",
        state === "current" && "border-mint-400",
        ringClass,
      )}
    >
      <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-full border-b-4 text-white", face)}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-black text-ink">{label}</span>
        {sub && <span className="block truncate text-xs font-bold text-muted">{sub}</span>}
      </span>
      {state === "done" && (
        <span className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-700">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      )}
    </button>
  );
}
