import type { ReactNode } from "react";
import { cn } from "./ui";

/* ─── Pebble illustration system ─────────────────────────────────────────────
   Custom flat vector art for emotional / decorative moments.
   Functional UI icons stay Lucide; everything here is hand-drawn SVG.
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

/* Chapter scenes — flat playful vignettes */
export function ChapterArt({ chapterId, className }: { chapterId: string; className?: string }) {
  if (chapterId === "ch-01")
    return (
      <svg viewBox="0 0 160 100" className={className} role="img" aria-label="Island market scene">
        <circle cx="128" cy="22" r="14" fill="#ffc800" stroke="#e0a800" strokeWidth="3" />
        <ellipse cx="40" cy="26" rx="16" ry="7" fill="#fff" opacity=".9" />
        <ellipse cx="66" cy="20" rx="12" ry="6" fill="#fff" opacity=".7" />
        <path d="M0 78Q40 62 80 76T160 74V100H0V78Z" fill="#1cb0f6" />
        <path d="M0 84Q40 72 80 82T160 80V100H0V84Z" fill="#1899d6" opacity=".6" />
        <ellipse cx="80" cy="80" rx="42" ry="12" fill="#ffe9cf" stroke="#e0a800" strokeWidth="3" />
        <rect x="62" y="52" width="36" height="24" rx="4" fill="#fff" stroke="#3c3c3c" strokeWidth="3" />
        <path d="M58 52h44l-4-10H62l-4 10Z" fill="#ff6b6b" stroke="#e54848" strokeWidth="3" />
        <path d="M66 52v-8M76 52v-8M86 52v-8M94 52v-8" stroke="#fff" strokeWidth="3" />
        <rect x="74" y="62" width="12" height="14" rx="2" fill="#58cc02" />
        <circle cx="52" cy="66" r="6" fill="#8fd14f" stroke="#46a302" strokeWidth="2.5" />
        <circle cx="110" cy="64" r="7" fill="#8fd14f" stroke="#46a302" strokeWidth="2.5" />
      </svg>
    );
  if (chapterId === "ch-02")
    return (
      <svg viewBox="0 0 160 100" className={className} role="img" aria-label="Accounting scene">
        <rect x="18" y="14" width="64" height="72" rx="10" fill="#fff" stroke="#3c3c3c" strokeWidth="3.5" />
        <rect x="18" y="14" width="64" height="20" rx="10" fill="#1cb0f6" />
        <rect x="28" y="20" width="30" height="8" rx="4" fill="#fff" opacity=".85" />
        <path d="M28 44h44M28 54h44M28 64h30" stroke="#d8d2c2" strokeWidth="5" strokeLinecap="round" />
        <path d="M28 74h20" stroke="#58cc02" strokeWidth="5" strokeLinecap="round" />
        <circle cx="118" cy="62" r="24" fill="#ffc800" stroke="#e0a800" strokeWidth="3.5" />
        <text x="118" y="71" textAnchor="middle" fontWeight={900} fontSize="22" fill="#7a4a00" fontFamily="Nunito,sans-serif">M</text>
        <circle cx="98" cy="30" r="12" fill="#ff6b6b" stroke="#e54848" strokeWidth="3" />
        <text x="98" y="35" textAnchor="middle" fontWeight={900} fontSize="13" fill="#fff" fontFamily="Nunito,sans-serif">%</text>
        <path d="M104 70l14-18" stroke="#46a302" strokeWidth="5" strokeLinecap="round" />
        <path d="M110 52h8v8" stroke="#46a302" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (chapterId === "ch-03")
    return (
      <svg viewBox="0 0 160 100" className={className} role="img" aria-label="Harbour factory scene">
        <circle cx="30" cy="22" r="13" fill="#ffc800" stroke="#e0a800" strokeWidth="3" />
        <path d="M0 74h160v26H0z" fill="#1cb0f6" />
        <path d="M0 74h160" stroke="#1899d6" strokeWidth="3" />
        <rect x="96" y="30" width="44" height="30" rx="4" fill="#fff" stroke="#3c3c3c" strokeWidth="3" />
        <rect x="102" y="22" width="8" height="12" fill="#9a9a9a" />
        <rect x="122" y="22" width="8" height="12" fill="#9a9a9a" />
        <rect x="102" y="38" width="12" height="10" fill="#ddf4ff" stroke="#1899d6" strokeWidth="2" />
        <rect x="118" y="38" width="12" height="10" fill="#ddf4ff" stroke="#1899d6" strokeWidth="2" />
        <path d="M30 62h44l-6 14H36l-6-14Z" fill="#ff9600" stroke="#d97a00" strokeWidth="3" />
        <rect x="46" y="48" width="12" height="14" fill="#fff" stroke="#3c3c3c" strokeWidth="2.5" />
        <rect x="30" y="76" width="44" height="5" rx="2.5" fill="#7c4300" />
        <rect x="18" y="52" width="16" height="12" rx="2" fill="#a560ff" stroke="#8548e0" strokeWidth="2.5" />
        <rect x="70" y="54" width="16" height="12" rx="2" fill="#58cc02" stroke="#46a302" strokeWidth="2.5" />
      </svg>
    );
  return (
    <svg viewBox="0 0 160 100" className={className} role="img" aria-label="Business district scene">
      <circle cx="128" cy="22" r="13" fill="#ffc800" stroke="#e0a800" strokeWidth="3" />
      <rect x="22" y="34" width="34" height="52" rx="4" fill="#1cb0f6" stroke="#1899d6" strokeWidth="3" />
      <rect x="60" y="20" width="40" height="66" rx="4" fill="#a560ff" stroke="#8548e0" strokeWidth="3" />
      <rect x="104" y="42" width="32" height="44" rx="4" fill="#ff9600" stroke="#d97a00" strokeWidth="3" />
      {[42, 52, 62].map((y) => (
        <g key={y}>
          <rect x="28" y={y} width="8" height="6" fill="#fff" opacity=".9" />
          <rect x="66" y={y - 14} width="9" height="7" fill="#fff" opacity=".9" />
          <rect x="80" y={y - 14} width="9" height="7" fill="#fff" opacity=".9" />
        </g>
      ))}
      <rect x="0" y="86" width="160" height="14" fill="#e8ddc4" />
      <circle cx="48" cy="72" r="6" fill="#8fd14f" stroke="#46a302" strokeWidth="2.5" />
      <circle cx="120" cy="70" r="7" fill="#8fd14f" stroke="#46a302" strokeWidth="2.5" />
    </svg>
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
