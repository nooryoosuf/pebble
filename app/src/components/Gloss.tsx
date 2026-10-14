import { useMemo, useState } from "react";
import { lessons } from "../data/curriculum";
import { cn } from "./ui";

/* ─── Key-term tooltips ──────────────────────────────────────────────────────
   Every key term from every topic becomes tappable/hoverable anywhere notes
   or guides render (Learn cards, flashcards, scenarios, explanations).
   Hover opens on precise pointers; tap toggles on touch; full keyboard
   support (focus opens, blur/Escape closes).
----------------------------------------------------------------------------- */

export interface GlossaryEntry {
  term: string;
  definition: string;
  lessonId: string;
  topicLabel: string;
}

let cache: GlossaryEntry[] | null = null;

export function getGlossary(): GlossaryEntry[] {
  if (!cache) {
    cache = [];
    for (const l of lessons) {
      for (const k of l.keyTerms) {
        if (!cache.some((e) => e.term.toLowerCase() === k.term.toLowerCase())) {
          cache.push({
            term: k.term,
            definition: k.definition,
            lessonId: l.lessonId,
            topicLabel: l.topicId.replace("top-", ""),
          });
        }
      }
    }
    // longest first so "Market Economy" wins over "Market", etc.
    cache.sort((a, b) => b.term.length - a.term.length);
  }
  return cache;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Term plus light plural/singular variants (needs↔need, liability↔liabilities). */
function variants(term: string): string[] {
  const v = new Set<string>([term, `${term}s`, `${term}es`]);
  if (/y$/i.test(term)) v.add(`${term.slice(0, -1)}ies`);
  if (/[^s]s$/i.test(term)) v.add(term.slice(0, -1));
  return [...v];
}

function Term({ entry, label, dark }: { entry: GlossaryEntry; label: string; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const touchOnly = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  return (
    <span className="relative inline">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`What does ${entry.term} mean?`}
        onMouseEnter={() => {
          if (!touchOnly()) setOpen(true);
        }}
        onMouseLeave={() => {
          if (!touchOnly()) setOpen(false);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => {
          if (touchOnly()) setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={cn(
          "cursor-help font-bold underline decoration-dotted underline-offset-[3px]",
          dark
            ? "text-white decoration-white/80"
            : "text-sky-700 decoration-sky-300 hover:decoration-sky-500",
        )}
      >
        {label}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2.5 w-56 max-w-[min(15rem,72vw)] -translate-x-1/2 rounded-2xl border-2 border-line bg-white p-3 text-left shadow-[0_10px_30px_-10px_rgba(60,60,60,.4)]"
        >
          <span className="block text-[13px] font-black text-ink">{entry.term}</span>
          <span className="mt-0.5 block text-xs leading-relaxed font-semibold text-muted">
            {entry.definition}
          </span>
          <span className="mt-1.5 inline-block rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-black text-mint-800">
            Lesson {entry.topicLabel}
          </span>
          <span className="absolute top-full left-1/2 -mt-[7px] h-3 w-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-line bg-white" aria-hidden />
        </span>
      )}
    </span>
  );
}

/** Render prose with every glossary term tappable. `dark` for mint-filled backs. */
export function Gloss({ text, dark = false }: { text: string; dark?: boolean }) {
  const nodes = useMemo(() => {
    const glossary = getGlossary();
    const lookup = new Map<string, GlossaryEntry>();
    const alts: string[] = [];
    for (const e of glossary) {
      for (const v of variants(e.term)) {
        const key = v.toLowerCase();
        if (!lookup.has(key)) {
          lookup.set(key, e);
          alts.push(escapeRegExp(v));
        }
      }
    }
    if (alts.length === 0) return [text];
    const re = new RegExp(`\\b(${alts.join("|")})\\b`, "gi");
    const out: (string | { match: string; entry: GlossaryEntry })[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push(text.slice(last, m.index));
      const entry = lookup.get(m[0].toLowerCase());
      if (entry) out.push({ match: m[0], entry });
      else out.push(m[0]);
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [text]);

  return (
    <>
      {nodes.map((n, i) =>
        typeof n === "string" ? (
          <span key={i}>{n}</span>
        ) : (
          <Term key={i} entry={n.entry} label={n.match} dark={dark} />
        ),
      )}
    </>
  );
}
