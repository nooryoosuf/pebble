import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpenText, LayoutDashboard, Users, Trophy, CircleUserRound, LogOut, Flame } from "lucide-react";
import { useProgress, levelForXp } from "../lib/store";
import { isSupabaseConfigured } from "../lib/supabase";
import { AppIcon } from "./PebbleMascot";
import { CelebrationOverlay } from "./BadgeOverlays";
import { FlameArt, BoltArt } from "./art";
import { cn } from "./ui";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { progress, logout, isLoggedIn } = useProgress();
  const nav = useNavigate();
  const { level } = levelForXp(progress.xp);

const tabs = [
  { to: "/dashboard", label: "Learn", icon: LayoutDashboard, active: "text-mint-700", pill: "bg-mint-100" },
  { to: "/journey", label: "Journey", icon: BookOpenText, active: "text-sky-700", pill: "bg-sky-100" },
  { to: "/challenge", label: "Challenge", icon: Trophy, active: "text-tang-500", pill: "bg-tang-100" },
  { to: "/profile", label: "Profile", icon: CircleUserRound, active: "text-coral-700", pill: "bg-coral-100" },
  { to: "/parent", label: "Parents", icon: Users, active: "text-grape-700", pill: "bg-grape-100" },
] as const;

  const tabCls = (tone: { active: string; pill: string }) =>
    ({ isActive }: { isActive: boolean }) =>
      cn(
        "flex min-h-[60px] min-w-[62px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-black transition",
        isActive ? cn(tone.pill, tone.active) : "text-faint hover:bg-parchment hover:text-muted",
      );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b-2 border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Pebble home">
            <AppIcon size={44} className="shadow-[0_3px_0_rgba(60,60,60,0.12)]" />
            <span>
              <span className="block text-xl leading-none font-black tracking-tight text-ink">
                pebble
              </span>
              <span className="block text-[10px] font-black tracking-[0.14em] text-faint uppercase">
                Business Studies · Gr 7
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isLoggedIn && progress.role === "student" && (
              <div className="hidden items-center gap-1.5 sm:flex" aria-label="Your stats">
                <span className="flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-black text-tang-500" title="Day streak">
                  <FlameArt size={18} /> {progress.streakDays}
                </span>
                <span className="flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-black text-sun-500" title="Experience points">
                  <BoltArt size={18} /> {progress.xp}
                </span>
                <span className="rounded-xl bg-grape-100 px-2 py-1 text-xs font-black text-grape-700" title="Level">
                  LV {level}
                </span>
              </div>
            )}
            {/* top nav: tablets + desktop only (mobile uses the bottom tab bar) */}
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
              {tabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 rounded-2xl border-b-4 px-3 py-1.5 text-sm font-black transition",
                      isActive
                        ? cn("border-current", t.pill, t.active)
                        : "border-transparent text-muted hover:bg-parchment hover:text-ink",
                    )
                  }
                >
                  <t.icon size={16} strokeWidth={2.75} /> <span className="hidden md:inline">{t.label}</span>
                </NavLink>
              ))}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    logout();
                    nav("/");
                  }}
                  className="ml-1 flex cursor-pointer items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-sm font-black text-faint hover:bg-coral-100 hover:text-coral-700"
                  title={`Sign out ${progress.userName}`}
                >
                  <LogOut size={15} strokeWidth={2.75} />
                  <span className="hidden max-w-20 truncate lg:inline">{progress.userName}</span>
                </button>
              )}
            </nav>
            {/* compact sign-out on mobile (nav lives in the bottom bar) */}
            {isLoggedIn && (
              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-2xl px-2.5 py-2 text-sm font-black text-faint hover:bg-coral-100 hover:text-coral-700 sm:hidden"
                title={`Sign out ${progress.userName}`}
                aria-label={`Sign out ${progress.userName}`}
              >
                <LogOut size={17} strokeWidth={2.75} />
              </button>
            )}
          </div>
        </div>
        {!isSupabaseConfigured && (
          <div className="border-t-2 border-sky-200 bg-sky-100 px-4 py-1.5 text-center text-xs font-extrabold text-sky-700">
            Demo mode — progress is saved on this device only. Add Supabase keys to sync remotely.
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:pb-16">{children}</main>

      {/* global badge reward popup */}
      <CelebrationOverlay />

      {/* mobile bottom tab bar: roomy labeled tabs, home-indicator safe area */}
      <nav
        aria-label="Main mobile"
        className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-white/97 shadow-[0_-4px_16px_rgba(60,60,60,0.08)] backdrop-blur sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-md items-stretch gap-1.5 px-3 pt-2 pb-2.5">
          {tabs.map((t) => (
            <NavLink key={t.to} to={t.to} className={tabCls(t)} aria-label={t.label}>
              <t.icon size={22} strokeWidth={2.75} />
              <span className="leading-none">{t.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <footer className="border-t-2 border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-5">
          <span className="flex items-center gap-2 text-xs font-extrabold text-muted">
            <AppIcon size={22} /> Pebble · Exploring Business Studies 7 · pp. 1–130 referenced in every lesson
          </span>
          <span className="flex items-center gap-1 text-xs font-extrabold text-tang-500">
            <Flame size={13} strokeWidth={2.75} /> One pebble a day keeps forgetting away
          </span>
        </div>
      </footer>
    </div>
  );
}
