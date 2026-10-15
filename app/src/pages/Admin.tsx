import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Activity,
  Flame,
  Star,
  Medal,
  Crown,
  RefreshCw,
  Loader2,
  Search,
  KeyRound,
  Trash2,
} from "lucide-react";
import { Button, Card, Badge } from "../components/ui";
import { EmptyArt } from "../components/art";
import { supabase } from "../lib/supabase";
import { lessons } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { cn } from "../components/ui";

/* ─── Admin console ──────────────────────────────────────────────────────────
   Owner-only platform overview. Every number comes from live Supabase rows
   (admin RLS policies + admin_overview RPC) — nothing estimated or sampled.
----------------------------------------------------------------------------- */

interface Overview {
  parents: number; students: number; child_profiles: number;
  attempts: number; attempts_7d: number;
  active_today: number; active_7d: number; avg_score: number | null;
  xp_total: number; badges: number; master_clears: number;
  showdowns: number; objectives_mastered: number;
}
interface ChildProfileRow { id: string; display_name: string; parent_id: string }
interface AttemptRow {
  id: string; lesson_id: string; score_percent: number;
  band: string; created_at: string; student_id: string;
}
interface ProfileRow { id: string; display_name: string; role: string; xp: number }
interface LoginRow {
  id: string; email: string; createdAt: string; lastSignIn: string | null;
  displayName: string; role: string; isAdmin: boolean;
  children: { id: string; displayName: string }[];
}

const lessonTitle = (id: string) =>
  lessons.find((l) => l.lessonId === id)?.title ?? (id === "lesson-master" ? "Final Showdown" : id);

export default function Admin() {
  const { isLoggedIn, isAdmin } = useProgress();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [links, setLinks] = useState<{ parent_id: string; student_id: string }[]>([]);
  const [kidProfiles, setKidProfiles] = useState<ChildProfileRow[]>([]);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});
  const [logins, setLogins] = useState<LoginRow[]>([]);
  const [loginsError, setLoginsError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loginMsg, setLoginMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const ov = await supabase.rpc("admin_overview");
      if (ov.error) throw ov.error;
      setOverview(ov.data as Overview);
      const [att, prof, lnk, bdg, kids] = await Promise.all([
        supabase.from("attempts").select("id,lesson_id,score_percent,band,created_at,student_id").order("created_at", { ascending: false }).limit(500),
        supabase.from("profiles").select("id,display_name,role,xp"),
        supabase.from("parent_links").select("parent_id,student_id"),
        supabase.from("earned_badges").select("student_id,badge_id"),
        supabase.from("child_profiles").select("id,display_name,parent_id"),
      ]);
      for (const r of [att, prof, lnk, bdg, kids]) if (r.error) throw r.error;
      setAttempts((att.data ?? []) as AttemptRow[]);
      setProfiles((prof.data ?? []) as ProfileRow[]);
      setLinks((lnk.data ?? []) as { parent_id: string; student_id: string }[]);
      setKidProfiles((kids.data ?? []) as ChildProfileRow[]);
      const counts: Record<string, number> = {};
      for (const b of (bdg.data ?? []) as { student_id: string }[]) {
        counts[b.student_id] = (counts[b.student_id] ?? 0) + 1;
      }
      setBadgeCounts(counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load platform data");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogins = useCallback(async () => {
    if (!supabase) return;
    setLoginsError(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", { body: { action: "list" } });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setLogins(((data as { users: LoginRow[] }).users ?? []));
    } catch (e) {
      setLoginsError(e instanceof Error ? e.message : "Could not load logins");
    }
  }, []);

  const doResetPassword = useCallback(
    async (id: string) => {
      if (!supabase || newPw.length < 8) return;
      setLoginBusy(true);
      setLoginMsg(null);
      try {
        const { data, error } = await supabase.functions.invoke("admin-users", {
          body: { action: "reset-password", userId: id, password: newPw },
        });
        if (error) throw error;
        if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
        setLoginMsg({ ok: true, text: "Password updated — share the new one with them directly." });
        setResetId(null);
        setNewPw("");
      } catch (e) {
        setLoginMsg({ ok: false, text: e instanceof Error ? e.message : "Reset failed" });
      } finally {
        setLoginBusy(false);
      }
    },
    [newPw],
  );

  const doDeleteUser = useCallback(async (id: string) => {
    if (!supabase) return;
    setLoginBusy(true);
    setLoginMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "delete-user", userId: id },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setLogins((ls) => ls.filter((l) => l.id !== id));
      setConfirmDeleteId(null);
      setLoginMsg({ ok: true, text: "Account and all its learning data deleted." });
      await load();
    } catch (e) {
      setLoginMsg({ ok: false, text: e instanceof Error ? e.message : "Delete failed" });
    } finally {
      setLoginBusy(false);
    }
  }, [load]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      void load();
      void loadLogins();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, isAdmin, load, loadLogins]);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <p className="mt-2 text-lg font-black text-slate-ink">Admin console</p>
          <p className="text-sm font-semibold text-slate-muted">Sign in with the owner account to view platform data.</p>
          <Link to="/start"><Button variant="blue" className="mt-4 w-full">Sign in</Button></Link>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <EmptyArt className="mx-auto h-24 w-auto" />
          <p className="mt-2 text-lg font-black text-slate-ink">Owners only</p>
          <p className="text-sm font-semibold text-slate-muted">This console is restricted to site administrators.</p>
          <Link to="/dashboard"><Button variant="blue" className="mt-4 w-full">Back to learning</Button></Link>
        </Card>
      </div>
    );
  }

  const names = new Map(profiles.map((p) => [p.id, p.display_name]));
  const studentIds = new Set(links.map((l) => l.student_id));
  // every learner: login accounts + password-free child profiles
  const allLearners: { id: string; displayName: string; parentId: string | null; via: string }[] = [
    ...profiles.filter((p) => p.role === "student").map((s) => {
      const parentId = links.find((l) => l.student_id === s.id)?.parent_id ?? null;
      return { id: s.id, displayName: s.display_name, parentId, via: "login" };
    }),
    ...kidProfiles.map((k) => ({ id: k.id, displayName: k.display_name, parentId: k.parent_id, via: "profile" })),
  ];

  // 14-day activity
  const days: { key: string; label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      count: attempts.filter((a) => a.created_at.slice(0, 10) === key).length,
    });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const dayAvgs = days.map((d) => {
    const rel = attempts.filter((a) => a.created_at.slice(0, 10) === d.key);
    return { ...d, avg: rel.length ? Math.round(rel.reduce((t, a) => t + a.score_percent, 0) / rel.length) : null };
  });
  const bandMix = [
    { label: "Cleared", n: attempts.filter((a) => a.band === "progress").length, cls: "bg-mint-400" },
    { label: "Practise", n: attempts.filter((a) => a.band === "practice").length, cls: "bg-tang-400" },
    { label: "Revision", n: attempts.filter((a) => a.band === "revision").length, cls: "bg-coral-400" },
  ];
  const bandTotal = Math.max(1, bandMix.reduce((t, b) => t + b.n, 0));
  const filteredLogins = logins.filter((l) => {
    const q = query.trim().toLowerCase();
    return q.length === 0 || l.displayName.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
  });

  const kpis = overview
    ? [
        { icon: Users, label: "Families", value: `${overview.parents}`, sub: `${overview.students + overview.child_profiles} learners` },
        { icon: Activity, label: "Attempts", value: `${overview.attempts}`, sub: `${overview.attempts_7d} in last 7 days` },
        { icon: Flame, label: "Active today", value: `${overview.active_today}`, sub: `${overview.active_7d} active this week` },
        { icon: Star, label: "Avg score", value: overview.avg_score === null ? "—" : `${overview.avg_score}%`, sub: "all attempts" },
        { icon: GraduationCap, label: "Total XP", value: `${overview.xp_total}`, sub: "earned platform-wide" },
        { icon: Medal, label: "Badges", value: `${overview.badges}`, sub: `${overview.objectives_mastered} objectives mastered` },
        { icon: Crown, label: "Master clears", value: `${overview.master_clears}`, sub: `${overview.showdowns} showdowns cleared` },
      ]
    : [];

  return (
    <div className="text-slate-ink">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-line bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white">
            <ShieldCheck size={22} strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-slate-muted uppercase">Admin console</p>
            <h1 className="text-2xl font-black">Platform overview</h1>
            <p className="text-xs font-semibold text-slate-muted">Live rows from your database — nothing sampled or estimated.</p>
          </div>
        </div>
        <Button variant="white" className="px-3 py-2 text-xs" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 size={14} strokeWidth={3} className="animate-spin" /> : <RefreshCw size={14} strokeWidth={3} />}
          Refresh
        </Button>
      </div>

      {loading && (
        <Card className="mt-3 flex items-center justify-center gap-2 p-8 text-sm font-bold text-slate-muted">
          <Loader2 size={18} strokeWidth={2.75} className="animate-spin" /> Loading platform data…
        </Card>
      )}
      {error && (
        <Card className="mt-3 border-coral-400/50 bg-coral-100/40 p-4 text-sm font-bold text-coral-700" >
          <p role="alert">Couldn't load admin data: {error}</p>
          <p className="mt-1 text-xs font-semibold">If you just added yourself as admin, sign out and back in, then retry.</p>
        </Card>
      )}

      {!loading && !error && overview && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map((k) => (
              <Card key={k.label} className="p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">
                  <k.icon size={13} strokeWidth={2.75} /> {k.label}
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums">{k.value}</p>
                <p className="text-xs font-semibold text-slate-muted">{k.sub}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <p className="text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">Attempts · last 14 days</p>
              <div className="mt-3 flex h-24 items-end gap-1">
                {days.map((d) => (
                  <div key={d.key} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${d.count}`}>
                    <div className="w-full rounded-t-md bg-sky-400" style={{ height: `${Math.max(6, (d.count / maxDay) * 72)}px` }} />
                    <span className="hidden text-[9px] font-bold text-slate-muted sm:block">{d.label.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">Average score · last 14 days</p>
              <div className="mt-3 flex h-24 items-end gap-1">
                {dayAvgs.map((d) => (
                  <div key={d.key} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${d.avg === null ? "no attempts" : d.avg + "%"}`}>
                    <div
                      className={cn("w-full rounded-t-md", d.avg === null ? "bg-line" : d.avg >= 80 ? "bg-mint-400" : d.avg >= 50 ? "bg-tang-400" : "bg-coral-400")}
                      style={{ height: `${d.avg === null ? 6 : Math.max(8, (d.avg / 100) * 72)}px` }}
                    />
                    <span className="hidden text-[9px] font-bold text-slate-muted tabular-nums sm:block">{d.avg === null ? "—" : `${d.avg}`}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-3 border-t border-line pt-2">
                {bandMix.map((b) => (
                  <span key={b.label} className="flex items-center gap-1.5 text-[11px] font-black text-slate-muted">
                    <span className={cn("h-2.5 w-2.5 rounded-full", b.cls)} />
                    {b.label} {Math.round((b.n / bandTotal) * 100)}%
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">Families · {allLearners.length} learners</p>
            {allLearners.length === 0 ? (
              <p className="mt-1.5 text-sm font-semibold text-slate-muted">No learners yet — they appear here the moment a family starts.</p>
            ) : (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-[13px]">
                  <thead>
                    <tr className="text-slate-muted">
                      <th className="py-1.5 pr-3 font-extrabold">Learner</th>
                      <th className="py-1.5 pr-3 font-extrabold">Parent</th>
                      <th className="py-1.5 pr-3 text-right font-extrabold">Attempts</th>
                      <th className="py-1.5 pr-3 text-right font-extrabold">Avg</th>
                      <th className="py-1.5 pr-3 text-right font-extrabold">Badges</th>
                      <th className="py-1.5 text-right font-extrabold">Last active</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {allLearners.map((s, i) => {
                      const rel = attempts.filter((a) => a.student_id === s.id);
                      const avg = rel.length ? Math.round(rel.reduce((t, a) => t + a.score_percent, 0) / rel.length) : null;
                      const last = rel.length ? rel[0].created_at.slice(0, 10) : "—";
                      return (
                        <tr key={s.id} className={cn(i % 2 === 0 ? "border-t border-line bg-stage/60" : "border-t border-line")}>
                          <td className="py-2 pr-3 font-bold">
                            {s.displayName}
                            {s.via === "profile"
                              ? <Badge tone="sky" className="ml-1.5">profile</Badge>
                              : !s.parentId && <Badge tone="coral" className="ml-1.5">unlinked</Badge>}
                          </td>
                          <td className="py-2 pr-3 font-semibold text-slate-muted">{s.parentId ? (names.get(s.parentId) ?? "—") : "—"}</td>
                          <td className="py-2 pr-3 text-right font-black">{rel.length}</td>
                          <td className="py-2 pr-3 text-right font-black">{avg === null ? "—" : `${avg}%`}</td>
                          <td className="py-2 pr-3 text-right font-black">{badgeCounts[s.id] ?? 0}</td>
                          <td className="py-2 text-right font-semibold">{last}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {studentIds.size === 0 && kidProfiles.length === 0 && profiles.length > 0 && (
              <p className="mt-2 text-xs font-semibold text-slate-muted">Parent accounts with no children don't appear here.</p>
            )}
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">
                Logins & access · {filteredLogins.length} account{filteredLogins.length === 1 ? "" : "s"}
              </p>
              <label className="flex items-center gap-1.5 rounded-xl border-2 border-line px-2.5 py-1.5 text-xs font-bold text-slate-muted focus-within:border-sky-400">
                <Search size={13} strokeWidth={2.75} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or email…"
                  className="w-40 bg-transparent outline-none placeholder:text-faint"
                />
              </label>
            </div>
            {loginsError ? (
              <p className="mt-2 rounded-xl border-2 border-coral-400/50 bg-coral-100/40 px-3 py-2 text-xs font-bold text-coral-700" role="alert">
                {loginsError}
              </p>
            ) : filteredLogins.length === 0 ? (
              <p className="mt-2 text-sm font-semibold text-slate-muted">
                {logins.length === 0 ? "No accounts yet — they appear here the moment someone signs up." : "No accounts match that search."}
              </p>
            ) : (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-[13px]">
                  <thead>
                    <tr className="text-slate-muted">
                      <th className="py-1.5 pr-3 font-extrabold">Account</th>
                      <th className="py-1.5 pr-3 font-extrabold">Email</th>
                      <th className="py-1.5 pr-3 font-extrabold">Children</th>
                      <th className="py-1.5 pr-3 text-right font-extrabold">Last sign-in</th>
                      <th className="py-1.5 text-right font-extrabold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogins.map((l, i) => (
                      <tr key={l.id} className={i % 2 === 0 ? "border-t border-line bg-stage/60" : "border-t border-line"}>
                        <td className="py-2 pr-3 font-bold">
                          {l.displayName}
                          <span className={cn(
                            "ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase",
                            l.isAdmin ? "bg-ink text-white" : l.role === "parent" ? "bg-sky-100 text-sky-700" : "bg-mint-100 text-mint-800",
                          )}>
                            {l.isAdmin ? "owner" : l.role}
                          </span>
                        </td>
                        <td className="max-w-44 truncate py-2 pr-3 font-semibold text-slate-muted" title={l.email}>{l.email}</td>
                        <td className="py-2 pr-3 font-semibold text-slate-muted">
                          {l.children.length === 0 ? "—" : l.children.map((c) => c.displayName).join(", ")}
                        </td>
                        <td className="py-2 pr-3 text-right font-semibold tabular-nums">
                          {l.lastSignIn ? l.lastSignIn.slice(0, 10) : "never"}
                        </td>
                        <td className="py-2 text-right">
                          <span className="inline-flex gap-1">
                            <button
                              onClick={() => { setResetId(resetId === l.id ? null : l.id); setNewPw(""); setConfirmDeleteId(null); }}
                              className="cursor-pointer rounded-lg border border-line px-2 py-1 text-[11px] font-black text-slate-muted hover:border-sky-400 hover:text-sky-700"
                              title="Set a new password for this account"
                            >
                              <KeyRound size={12} strokeWidth={3} className="inline" /> Password
                            </button>
                            <button
                              onClick={() => { setConfirmDeleteId(confirmDeleteId === l.id ? null : l.id); setResetId(null); }}
                              className="cursor-pointer rounded-lg border border-line px-2 py-1 text-[11px] font-black text-slate-muted hover:border-coral-400 hover:text-coral-700"
                              title="Delete this account and all its data"
                            >
                              <Trash2 size={12} strokeWidth={3} className="inline" />
                            </button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {resetId && (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-sky-400/50 bg-sky-100/50 p-3">
                <span className="text-xs font-black text-sky-700">
                  New password for {filteredLogins.find((l) => l.id === resetId)?.displayName}:
                </span>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="8+ characters"
                  autoComplete="new-password"
                  className="w-44 rounded-xl border-2 border-line bg-white px-2.5 py-1.5 text-sm font-bold outline-none focus:border-sky-400"
                />
                <Button variant="blue" className="px-3 py-1.5 text-xs" disabled={newPw.length < 8 || loginBusy} onClick={() => void doResetPassword(resetId)}>
                  {loginBusy ? "Saving…" : "Set password"}
                </Button>
                <button onClick={() => setResetId(null)} className="cursor-pointer text-xs font-black text-slate-muted underline">Cancel</button>
              </div>
            )}
            {confirmDeleteId && (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-coral-400/50 bg-coral-100/40 p-3">
                <span className="text-xs font-black text-coral-700">
                  Delete {filteredLogins.find((l) => l.id === confirmDeleteId)?.displayName} and ALL their learning data? This can't be undone.
                </span>
                <Button variant="coral" className="px-3 py-1.5 text-xs" disabled={loginBusy} onClick={() => void doDeleteUser(confirmDeleteId)}>
                  {loginBusy ? "Deleting…" : "Yes, delete everything"}
                </Button>
                <button onClick={() => setConfirmDeleteId(null)} className="cursor-pointer text-xs font-black text-slate-muted underline">Keep</button>
              </div>
            )}
            {loginMsg && (
              <p className={cn("mt-2 rounded-xl border-2 px-3 py-2 text-xs font-bold", loginMsg.ok ? "border-mint-400/50 bg-mint-50 text-mint-800" : "border-coral-400/50 bg-coral-100/40 text-coral-700")} role="alert">
                {loginMsg.text}
              </p>
            )}
          </Card>

          <Card>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-muted uppercase">Latest activity</p>
            {attempts.length === 0 ? (
              <p className="mt-1.5 text-sm font-semibold text-slate-muted">No attempts recorded yet.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {attempts.slice(0, 12).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-stage/50 px-3 py-2 text-[13px] font-bold">
                    <span className="min-w-0 truncate">
                      {names.get(a.student_id) ?? "Unknown"} · {lessonTitle(a.lesson_id)}
                      <span className="ml-1.5 font-semibold text-slate-muted">{a.created_at.slice(0, 10)}</span>
                    </span>
                    <span className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
                      a.band === "progress" ? "bg-mint-100 text-mint-800" : a.band === "practice" ? "bg-tang-100 text-tang-700" : "bg-coral-100 text-coral-700",
                    )}>
                      {a.score_percent}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
