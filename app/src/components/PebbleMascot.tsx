import { SpeechBubble } from "./ui";
import { cn } from "./ui";

/* ─── Pebble — recognizable mascot with expressive poses ─────────────────────
   Mint pebble body, big glossy eyes, rosy cheeks, stubby arms + feet.
   Moods: happy | cheer | think | sad | star | reading | sleep
----------------------------------------------------------------------------- */

export type MascotMood = "happy" | "cheer" | "think" | "sad" | "star" | "reading" | "sleep";

const INK = "#3c3c3c";

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === "sleep")
    return (
      <g stroke={INK} strokeWidth="4" strokeLinecap="round">
        <path d="M42 58q7 6 14 0" fill="none" />
        <path d="M64 58q7 6 14 0" fill="none" />
      </g>
    );
  if (mood === "star")
    return (
      <g>
        <path d="M49 46l2.6 5.2 5.8.9-4.2 4 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.2-4 5.8-.9L49 46Z" fill="#ffc800" stroke="#e0a800" strokeWidth="2" strokeLinejoin="round" />
        <path d="M71 46l2.6 5.2 5.8.9-4.2 4 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.2-4 5.8-.9L71 46Z" fill="#ffc800" stroke="#e0a800" strokeWidth="2" strokeLinejoin="round" />
      </g>
    );
  const look = mood === "think" ? 4 : 0;
  return (
    <g>
      <ellipse cx={47} cy={56} rx="9" ry="10.5" fill="#fff" />
      <ellipse cx={73} cy={56} rx="9" ry="10.5" fill="#fff" />
      <circle cx={47 + look} cy={58} r="4.6" fill={INK} />
      <circle cx={73 + look} cy={58} r="4.6" fill={INK} />
      <circle cx={48.5 + look} cy={56} r="1.7" fill="#fff" />
      <circle cx={74.5 + look} cy={56} r="1.7" fill="#fff" />
    </g>
  );
}

function Brows({ mood }: { mood: MascotMood }) {
  if (mood === "sad")
    return (
      <g stroke={INK} strokeWidth="3" strokeLinecap="round" opacity=".75">
        <path d="M38 44l12 4" />
        <path d="M82 44l-12 4" />
      </g>
    );
  if (mood === "think")
    return (
      <g stroke={INK} strokeWidth="3" strokeLinecap="round" opacity=".7">
        <path d="M38 44q8-3 15 0" fill="none" />
        <path d="M67 42q8-3 15 1" fill="none" />
      </g>
    );
  return null;
}

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case "cheer":
      return (
        <g>
          <ellipse cx="60" cy="72" rx="11" ry="9" fill={INK} />
          <ellipse cx="60" cy="75.5" rx="6" ry="4" fill="#ff6b6b" />
          <rect x="51" y="65.5" width="18" height="4.5" rx="2" fill="#fff" />
        </g>
      );
    case "sad":
      return <path d="M51 75q9-6 18 0" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    case "think":
      return <path d="M54 73q6-2 12 1" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    case "sleep":
      return <circle cx="60" cy="73" r="3" fill={INK} />;
    case "star":
    case "reading":
    case "happy":
    default:
      return <path d="M50 68q10 10 20 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />;
  }
}

export default function PebbleMascot({
  mood = "happy",
  size = 84,
  message,
  className,
}: {
  mood?: MascotMood;
  size?: number;
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="animate-floaty shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 116" width={size} height={size} role="img" aria-label={`Pebble mascot, feeling ${mood}`}>
          <ellipse cx="60" cy="107" rx="32" ry="6" fill="#e8ddc4" />
          {/* feet */}
          <ellipse cx="44" cy="100" rx="10" ry="6" fill="#ff9600" stroke="#d97a00" strokeWidth="2.5" />
          <ellipse cx="76" cy="100" rx="10" ry="6" fill="#ff9600" stroke="#d97a00" strokeWidth="2.5" />
          {/* arms */}
          {mood === "cheer" ? (
            <g stroke="#5ba300" strokeWidth="6" strokeLinecap="round">
              <path d="M20 62L10 44" />
              <path d="M100 62l10-18" />
            </g>
          ) : mood === "think" ? (
            <g stroke="#5ba300" strokeWidth="6" strokeLinecap="round">
              <path d="M22 70q-6 2-8 8" fill="none" />
              <path d="M98 66q6 0 8-8" fill="none" />
              <circle cx="105" cy="52" r="4" fill="#5ba300" />
            </g>
          ) : (
            <g stroke="#5ba300" strokeWidth="6" strokeLinecap="round">
              <path d="M20 68q-6 4-5 10" fill="none" />
              <path d="M100 68q6 4 5 10" fill="none" />
            </g>
          )}
          {/* body */}
          <path
            d="M60 10C90 10 105 34 101 60c-3.5 24-22 36-41 36S22 84 19 60C15 34 30 10 60 10Z"
            fill="#a9df6e"
            stroke="#5ba300"
            strokeWidth="4.5"
          />
          <ellipse cx="42" cy="32" rx="13" ry="7" fill="#fff" opacity=".5" transform="rotate(-18 42 32)" />
          {/* face */}
          <Brows mood={mood} />
          <Eyes mood={mood} />
          <ellipse cx="34" cy="68" rx="6.5" ry="4.5" fill="#ff6b6b" opacity=".55" />
          <ellipse cx="86" cy="68" rx="6.5" ry="4.5" fill="#ff6b6b" opacity=".55" />
          <Mouth mood={mood} />
          {/* accessories */}
          {mood === "cheer" && (
            <g>
              <path d="M60 10L44 30h32L60 10Z" fill="#1cb0f6" stroke="#1899d6" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="60" cy="10" r="4" fill="#ff6b6b" stroke="#e54848" strokeWidth="2" />
              <circle cx="50" cy="24" r="2.4" fill="#ffc800" />
              <circle cx="60" cy="22" r="2.4" fill="#ff6b6b" />
              <circle cx="70" cy="24" r="2.4" fill="#fff" />
              <circle cx="14" cy="30" r="3" fill="#ffc800" />
              <circle cx="106" cy="30" r="3" fill="#ff6b6b" />
              <rect x="20" y="18" width="5" height="5" fill="#a560ff" transform="rotate(20 22 20)" />
              <rect x="96" y="18" width="5" height="5" fill="#58cc02" transform="rotate(-20 98 20)" />
            </g>
          )}
          {mood === "think" && (
            <g fill="#ddf4ff" stroke="#1899d6" strokeWidth="2">
              <circle cx="100" cy="30" r="5" />
              <circle cx="110" cy="20" r="7" />
              <circle cx="104" cy="22" r="2" fill="#1cb0f6" stroke="none" />
            </g>
          )}
          {mood === "sleep" && (
            <g>
              <path d="M78 22q4-12 16-12 0 10-6 14l-8 4-2-6Z" fill="#a560ff" stroke="#8548e0" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="94" cy="10" r="3.5" fill="#fff" />
              <text x="100" y="46" fontSize="13" fontWeight={900} fill="#8548e0" fontFamily="Nunito,sans-serif">z</text>
              <text x="108" y="36" fontSize="10" fontWeight={900} fill="#a560ff" fontFamily="Nunito,sans-serif">z</text>
            </g>
          )}
          {mood === "reading" && (
            <g>
              <rect x="38" y="78" width="44" height="20" rx="3" fill="#1cb0f6" stroke="#1899d6" strokeWidth="2.5" />
              <rect x="40" y="80" width="18" height="16" rx="2" fill="#fff" />
              <rect x="62" y="80" width="18" height="16" rx="2" fill="#ffde59" />
              <path d="M44 84h10M44 88h10M44 92h7M66 84h10M66 88h10" stroke="#9a9a9a" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          )}
          {mood === "star" && (
            <g>
              <circle cx="20" cy="34" r="2.6" fill="#ffc800" />
              <circle cx="100" cy="34" r="2.6" fill="#ffc800" />
              <path d="M60 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L60 2Z" fill="#ffc800" stroke="#e0a800" strokeWidth="1.4" />
            </g>
          )}
        </svg>
      </div>
      {message && <SpeechBubble>{message}</SpeechBubble>}
    </div>
  );
}

/** Compact face-only mark for headers / favicons. */
export function PebbleMark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 116" width={size} height={size} aria-hidden>
      <path
        d="M60 10C90 10 105 34 101 60c-3.5 24-22 36-41 36S22 84 19 60C15 34 30 10 60 10Z"
        fill="#a9df6e"
        stroke="#5ba300"
        strokeWidth="6"
      />
      <ellipse cx="47" cy="56" rx="10" ry="11.5" fill="#fff" />
      <ellipse cx="73" cy="56" rx="10" ry="11.5" fill="#fff" />
      <circle cx="47" cy="58.5" r="5" fill="#3c3c3c" />
      <circle cx="73" cy="58.5" r="5" fill="#3c3c3c" />
      <circle cx="48.8" cy="56.3" r="1.8" fill="#fff" />
      <circle cx="74.8" cy="56.3" r="1.8" fill="#fff" />
      <path d="M50 70q10 10 20 0" stroke="#3c3c3c" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="33" cy="68" rx="7" ry="5" fill="#ff6b6b" opacity=".55" />
      <ellipse cx="87" cy="68" rx="7" ry="5" fill="#ff6b6b" opacity=".55" />
    </svg>
  );
}
