import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(...inputs));
}

/* ─── 3D press buttons (Duolingo-inspired) ─────────────────────────────────── */

type BtnVariant = "primary" | "blue" | "coral" | "sun" | "tang" | "grape" | "outline" | "ghost" | "white";

const btnStyles: Record<BtnVariant, string> = {
  primary: "bg-mint-400 text-white border-mint-500 shadow-[0_4px_0_#46a302] hover:brightness-[1.04]",
  blue: "bg-sky-400 text-white border-sky-500 shadow-[0_4px_0_#1899d6] hover:brightness-[1.05]",
  coral: "bg-coral-400 text-white border-coral-500 shadow-[0_4px_0_#e54848] hover:brightness-[1.04]",
  sun: "bg-sun-400 text-[#5c3d00] border-sun-500 shadow-[0_4px_0_#e0a800] hover:brightness-[1.03]",
  tang: "bg-tang-400 text-white border-tang-500 shadow-[0_4px_0_#d97a00] hover:brightness-[1.04]",
  grape: "bg-grape-400 text-white border-grape-500 shadow-[0_4px_0_#8548e0] hover:brightness-[1.04]",
  white: "bg-white text-ink border-line-strong shadow-[0_4px_0_#d8d2c2] hover:bg-parchment",
  outline:
    "bg-white text-sky-700 border-sky-200 shadow-[0_4px_0_#b8e6ff] hover:bg-sky-100 border-2",
  ghost: "bg-transparent text-muted hover:bg-black/5 shadow-none border-transparent border-0",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const dimensional = variant !== "ghost";
  return (
    <button
      {...props}
      className={cn(
        "duo-press inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-extrabold tracking-wide transition active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0",
        dimensional && "border-b-4",
        btnStyles[variant],
        className,
      )}
    />
  );
}

/* ─── Cards ────────────────────────────────────────────────────────────────── */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-line bg-white p-5 shadow-[0_3px_0_rgba(60,60,60,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Colorful lesson/chapter card with a tinted top band. */
export function TintCard({
  tint = "bg-mint-50",
  ring = "border-line",
  className,
  children,
}: {
  tint?: string;
  ring?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("card-lift overflow-hidden rounded-3xl border-2 bg-white", ring, className)}>
      <div className={cn("px-5 pt-4 pb-1", tint)}>{children}</div>
    </div>
  );
}

/* ─── Pills / badges ───────────────────────────────────────────────────────── */

type Tone = "mint" | "sun" | "sky" | "coral" | "tang" | "grape" | "neutral";

const toneMap: Record<Tone, string> = {
  mint: "bg-mint-100 text-mint-800 border-mint-400/40",
  sun: "bg-sun-100 text-sun-700 border-sun-400/50",
  sky: "bg-sky-100 text-sky-700 border-sky-400/40",
  coral: "bg-coral-100 text-coral-700 border-coral-400/40",
  tang: "bg-tang-100 text-tang-700 border-tang-400/40",
  grape: "bg-grape-100 text-grape-700 border-grape-400/40",
  neutral: "bg-parchment text-muted border-line",
};

export function Badge({
  children,
  tone = "mint",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-extrabold whitespace-nowrap",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ─── Progress ─────────────────────────────────────────────────────────────── */

export function ProgressBar({
  value,
  max = 100,
  bar = "bg-mint-400",
  className,
}: {
  value: number;
  max?: number;
  bar?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("h-3.5 w-full overflow-hidden rounded-full bg-line/70", className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("relative h-full rounded-full transition-all duration-500", bar)} style={{ width: `${pct}%` }}>
        <div className="absolute inset-x-2 top-1 h-1.5 rounded-full bg-white/35" />
      </div>
    </div>
  );
}

/** Circular score ring used on results screens. */
export function ScoreRing({ pct, size = 120 }: { pct: number; size?: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const color = pct >= 80 ? "#58cc02" : pct >= 50 ? "#ff9600" : "#ff6b6b";
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" role="img" aria-label={`Score ${pct} percent`}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#ece7da" strokeWidth="12" />
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dashoffset .8s ease" }}
      />
      <text
        x="55"
        y="55"
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight={900}
        fontSize={String(pct).length > 2 ? 21 : 26}
        fill="#3c3c3c"
        fontFamily="Nunito, sans-serif"
      >
        {pct}%
      </text>
    </svg>
  );
}

/* ─── Type helpers ─────────────────────────────────────────────────────────── */

export function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mb-3">
      {eyebrow && (
        <p className="text-xs font-black tracking-[0.14em] text-sky-700 uppercase">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-black text-ink">{title}</h2>
      {sub && <p className="mt-1 text-sm font-bold text-muted">{sub}</p>}
    </div>
  );
}

export function SpeechBubble({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "animate-pop-in relative max-w-[280px] rounded-2xl rounded-bl-md border-2 border-line bg-white px-4 py-3 text-sm font-bold text-ink shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Stat chip for the header / dashboard (Duolingo-style flame, bolt, gem). */
export function StatChip({
  icon,
  value,
  label,
  tint,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  tint: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-2xl border-2 border-line bg-white px-3 py-1.5", tint)} title={label}>
      <span className="grid place-items-center">{icon}</span>
      <span className="text-sm font-black text-ink">{value}</span>
    </div>
  );
}
