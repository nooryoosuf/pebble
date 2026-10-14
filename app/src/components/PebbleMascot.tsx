import { SpeechBubble } from "./ui";
import { cn } from "./ui";
import mascotUrl from "../assets/mascot.svg";

/* ─── Pebble — official mascot artwork ───────────────────────────────────────
   Artwork supplied by the family (Mascot.svg). Moods share the artwork with
   small CSS overlays for celebration / sleep / star moments; the speech
   bubble carries the coaching message.
----------------------------------------------------------------------------- */

export type MascotMood = "happy" | "cheer" | "think" | "sad" | "star" | "reading" | "sleep";

function MoodOverlay({ mood }: { mood: MascotMood }) {
  if (mood === "cheer")
    return (
      <div className="pointer-events-none absolute -top-1 right-2 flex gap-1" aria-hidden>
        <span className="animate-bob h-2 w-2 rounded-full bg-sun-400" />
        <span className="animate-bob h-2 w-2 rounded-full bg-coral-400 [animation-delay:.2s]" />
        <span className="animate-bob h-2 w-2 rounded-full bg-sky-400 [animation-delay:.4s]" />
      </div>
    );
  if (mood === "sleep")
    return (
      <div className="pointer-events-none absolute -top-2 right-1 font-black text-grape-500" aria-hidden>
        <span className="animate-bob absolute right-6 -top-3 text-sm">z</span>
        <span className="animate-bob text-lg [animation-delay:.3s]">Z</span>
      </div>
    );
  if (mood === "star")
    return (
      <div className="pointer-events-none absolute inset-x-0 -top-2 flex justify-between px-1" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" className="animate-wiggle"><path d="M12 2l2.4 5.3 5.6.7-4.1 3.9 1.1 5.6-5-2.8-5 2.8 1.1-5.6L4 7.9l5.6-.7L12 2Z" fill="#ffc800" stroke="#e0a800" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        <svg width="12" height="12" viewBox="0 0 24 24" className="animate-wiggle [animation-delay:.3s]"><path d="M12 2l2.4 5.3 5.6.7-4.1 3.9 1.1 5.6-5-2.8-5 2.8 1.1-5.6L4 7.9l5.6-.7L12 2Z" fill="#ffde59" stroke="#e0a800" strokeWidth="1.5" strokeLinejoin="round" /></svg>
      </div>
    );
  if (mood === "think")
    return (
      <div className="pointer-events-none absolute -top-1 right-3 flex items-end gap-1" aria-hidden>
        <span className="h-1.5 w-1.5 rounded-full bg-sky-200" />
        <span className="h-2 w-2 rounded-full bg-sky-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
      </div>
    );
  return null;
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
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div className="animate-floaty h-full w-full">
          <img
            src={mascotUrl}
            alt={`Pebble mascot, feeling ${mood}`}
            width={size}
            height={size}
            draggable={false}
            className="h-full w-full object-contain select-none"
          />
        </div>
        <MoodOverlay mood={mood} />
      </div>
      {message && <SpeechBubble>{message}</SpeechBubble>}
    </div>
  );
}

/** Official app icon (supplied artwork) for headers, footers and favicons. */
export function AppIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}app-icon.svg`}
      alt="Pebble app icon"
      width={size}
      height={size}
      draggable={false}
      className={cn("rounded-[28%] object-contain select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}
