import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { GraduationCap, Users, ArrowRight, ArrowLeft, TriangleAlert, Loader2, Sparkles } from "lucide-react";
import { useProgress } from "../lib/store";
import { Button, Card } from "../components/ui";
import PebbleMascot from "../components/PebbleMascot";
import { cn } from "../components/ui";

export default function Start() {
  const { signUp, signIn, authError, authStatus, isLoggedIn, accountRole, enterDemo } = useProgress();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoggedIn) {
    return <Navigate to={accountRole === "parent" ? "/parent" : "/dashboard"} replace />;
  }

  const submit = async () => {
    setBusy(true);
    try {
      // New accounts are always parents — children join as profiles inside,
      // no email or password needed for them.
      const ok =
        mode === "signup"
          ? await signUp({ displayName: name, email, password, role: "parent" })
          : await signIn({ email, password });
      if (ok) nav("/parent");
    } finally {
      setBusy(false);
    }
  };

  const valid =
    email.includes("@") && password.length >= (mode === "signup" ? 8 : 1) && (mode === "signin" || name.trim().length >= 2);

  return (
    <div className="mx-auto max-w-lg">
      <div className="overflow-hidden rounded-[2rem] border-2 border-line bg-white">
        <div className="dot-grid bg-mint-400 px-6 pt-6 pb-4">
          <PebbleMascot mood="happy" size={96} message="Your progress saves to your own account — pick up on any device!" />
        </div>
        <div className="space-y-4 p-6">
          {authStatus === "unconfigured" && (
            <p className="flex items-start gap-2 rounded-2xl border-2 border-tang-400/50 bg-tang-100/60 p-3 text-[13px] font-bold text-tang-700">
              <TriangleAlert size={16} strokeWidth={2.75} className="mt-0.5 shrink-0" />
              Sign-in is unavailable: the backend isn't connected yet. Whoever hosts Pebble needs to add the Supabase keys (see README).
            </p>
          )}
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-stage p-1" role="tablist" aria-label="Sign in or create account">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "cursor-pointer rounded-xl px-3 py-2 text-sm font-black transition",
                  mode === m ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                )}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="pebble-name" className="text-xs font-black tracking-[0.12em] text-muted uppercase">
                Display name
              </label>
              <input
                id="pebble-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Yoonus"
                autoComplete="given-name"
                className="mt-1.5 w-full rounded-2xl border-2 border-line bg-stage px-4 py-3 text-[15px] font-bold text-ink outline-none placeholder:text-faint focus:border-sky-400"
              />
            </div>
          )}
          <div>
            <label htmlFor="pebble-email" className="text-xs font-black tracking-[0.12em] text-muted uppercase">
              Email
            </label>
            <input
              id="pebble-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-1.5 w-full rounded-2xl border-2 border-line bg-stage px-4 py-3 text-[15px] font-bold text-ink outline-none placeholder:text-faint focus:border-sky-400"
            />
          </div>
          <div>
            <label htmlFor="pebble-password" className="text-xs font-black tracking-[0.12em] text-muted uppercase">
              Password {mode === "signup" && <span className="text-faint">(8+ characters)</span>}
            </label>
            <input
              id="pebble-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="mt-1.5 w-full rounded-2xl border-2 border-line bg-stage px-4 py-3 text-[15px] font-bold text-ink outline-none placeholder:text-faint focus:border-sky-400"
            />
          </div>

          {mode === "signup" && (
            <div className="flex items-start gap-2.5 rounded-2xl border-2 border-mint-400/40 bg-mint-50 p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint-100 text-mint-700">
                <Users size={20} strokeWidth={2.5} />
              </span>
              <p className="text-[13px] font-bold text-ink">
                You're creating a <strong>parent account</strong>. Inside, you'll add a profile
                for each child — no email or password needed for them.
              </p>
            </div>
          )}

          {authError && (
            <p className="rounded-2xl border-2 border-coral-400/50 bg-coral-100/50 p-3 text-[13px] font-bold text-coral-700" role="alert">
              {authError}
            </p>
          )}

          <Button className="w-full text-base" disabled={!valid || busy || authStatus === "unconfigured"} onClick={submit}>
            {busy ? <Loader2 size={17} strokeWidth={3} className="animate-spin" /> : null}
            {mode === "signup" ? "Create my account" : "Sign in"} <ArrowRight size={17} strokeWidth={3} />
          </Button>
          <div className="flex items-center gap-2 text-[11px] font-black tracking-wider text-faint uppercase">
            <span className="h-0.5 flex-1 rounded bg-line" /> or <span className="h-0.5 flex-1 rounded bg-line" />
          </div>
          <Button
            variant="white"
            className="w-full"
            onClick={() => {
              enterDemo();
              nav("/dashboard");
            }}
          >
            <Sparkles size={16} strokeWidth={2.75} /> Explore the demo tour
          </Button>
          <p className="text-center text-xs font-bold text-muted">
            Just looking around? The demo tour opens a sample student — streaks, medals, parent report and all.{" "}
            <Link to="/" className="inline-flex items-center gap-1 font-black text-sky-700 underline">
              <ArrowLeft size={12} strokeWidth={3} /> Back home
            </Link>
          </p>
        </div>
      </div>
      <Card className="mt-3 flex items-center gap-3 border-dashed">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sun-100 text-sun-700">
          <GraduationCap size={20} strokeWidth={2.5} />
        </span>
        <p className="text-[13px] font-bold text-muted">
          Students get the playful world of missions and medals. Parents get calm reports plus the power to create their child's login.
        </p>
      </Card>
    </div>
  );
}
