import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { useProgress, type Role } from "../lib/store";
import { Button, Card } from "../components/ui";
import PebbleMascot from "../components/PebbleMascot";
import { cn } from "../components/ui";

export default function Start() {
  const { login } = useProgress();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("student");

  return (
    <div className="mx-auto max-w-lg">
      <div className="overflow-hidden rounded-[2rem] border-2 border-line bg-white">
        <div className="dot-grid bg-mint-400 px-6 pt-6 pb-4">
          <PebbleMascot mood="happy" size={96} message="Tell me your name and choose your path — learner or parent!" />
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label htmlFor="pebble-name" className="text-xs font-black tracking-[0.12em] text-muted uppercase">
              Your first name
            </label>
            <input
              id="pebble-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahmed"
              autoComplete="given-name"
              className="mt-1.5 w-full rounded-2xl border-2 border-line bg-stage px-4 py-3 text-[15px] font-bold text-ink outline-none placeholder:text-faint focus:border-sky-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Choose role">
            {(
              [
                { r: "student" as Role, icon: GraduationCap, tint: "bg-mint-100 text-mint-700", title: "Student", body: "Missions, streaks & medals" },
                { r: "parent" as Role, icon: Users, tint: "bg-sky-100 text-sky-700", title: "Parent", body: "Progress reports & goals" },
              ]
            ).map((o) => (
              <button
                key={o.r}
                role="radio"
                aria-checked={role === o.r}
                onClick={() => setRole(o.r)}
                className={cn(
                  "duo-press cursor-pointer rounded-2xl border-2 p-3 text-left",
                  role === o.r ? "border-mint-400 bg-mint-50" : "border-line bg-white hover:bg-stage",
                )}
              >
                <span className={cn("grid h-10 w-10 place-items-center rounded-xl", o.tint)}>
                  <o.icon size={20} strokeWidth={2.5} />
                </span>
                <span className="mt-1.5 block text-[15px] font-black text-ink">{o.title}</span>
                <span className="block text-xs font-bold text-muted">{o.body}</span>
              </button>
            ))}
          </div>
          <Button
            className="w-full text-base"
            onClick={() => {
              login(name.trim() || (role === "parent" ? "Parent" : "Learner"), role);
              nav(role === "parent" ? "/parent" : "/dashboard");
            }}
          >
            Let's go! <ArrowRight size={17} strokeWidth={3} />
          </Button>
          <p className="text-center text-xs font-bold text-muted">
            No password needed in demo mode.{" "}
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
          Students get the playful world of missions and medals. Parents get a calm, data-focused report — same account family, different views.
        </p>
      </Card>
    </div>
  );
}
