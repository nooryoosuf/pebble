// Pebble · admin-users Edge Function (OWNER ONLY)
// Lets a site admin (row in public.admins) manage logins: list every account
// with profile + linked children, reset a forgotten password, delete an
// account. The service_role key stays server-side as the SERVICE_ROLE_KEY
// secret — it is never shipped to the app.
//
// Deploy:  supabase functions deploy admin-users --no-verify-jwt
// (JWT is validated inside: caller must be in public.admins.)

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
if (!SERVICE_KEY) throw new Error("Missing SERVICE_ROLE_KEY function secret");

const ok = (data: unknown) => Response.json(data, { headers: cors });
const fail = (error: string, status = 400) => Response.json({ error }, { status, headers: cors });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return fail("POST only", 405);

  const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await callerClient.auth.getUser();
  if (!user) return fail("Sign in first", 401);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: me } = await admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!me) return fail("Owner admins only", 403);

  let body: { action?: string; userId?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  if (body.action === "list") {
    const users: { id: string; email?: string; created_at: string; last_sign_in_at?: string | null }[] = [];
    let page = 1;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
      if (error) return fail(error.message, 500);
      for (const u of data.users) {
        users.push({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at ?? null });
      }
      if (data.users.length < 100) break;
      page += 1;
      if (page > 20) break; // sane cap (~2000 accounts)
    }
    const [{ data: profiles }, { data: links }, { data: adminRows }] = await Promise.all([
      admin.from("profiles").select("id,display_name,role"),
      admin.from("parent_links").select("parent_id,student_id"),
      admin.from("admins").select("user_id"),
    ]);
    const adminIds = new Set(((adminRows ?? []) as { user_id: string }[]).map((a) => a.user_id));
    const nameOf = new Map(((profiles ?? []) as { id: string; display_name: string; role: string }[]).map((p) => [p.id, p]));
    const kidsOf = new Map<string, string[]>();
    for (const l of ((links ?? []) as { parent_id: string; student_id: string }[])) {
      const arr = kidsOf.get(l.parent_id) ?? [];
      arr.push(l.student_id);
      kidsOf.set(l.parent_id, arr);
    }
    return ok({
      users: users.map((u) => {
        const p = nameOf.get(u.id) as { display_name: string; role: string } | undefined;
        const kids = (kidsOf.get(u.id) ?? []).map((kid) => {
          const kp = nameOf.get(kid) as { display_name: string } | undefined;
          return { id: kid, displayName: kp?.display_name ?? "—" };
        });
        return {
          id: u.id,
          email: u.email ?? "—",
          createdAt: u.created_at,
          lastSignIn: u.last_sign_in_at ?? null,
          displayName: p?.display_name ?? "—",
          role: p?.role ?? "unknown",
          children: kids,
          isAdmin: adminIds.has(u.id),
        };
      }),
    });
  }

  if (body.action === "reset-password") {
    if (!body.userId) return fail("Missing userId");
    if (!body.password || body.password.length < 8) return fail("New password must be at least 8 characters");
    const { error } = await admin.auth.admin.updateUserById(body.userId, { password: body.password });
    if (error) return fail(error.message, 500);
    return ok({ ok: true });
  }

  if (body.action === "delete-user") {
    if (!body.userId) return fail("Missing userId");
    if (body.userId === user.id) return fail("You cannot delete your own owner account here");
    const { error } = await admin.auth.admin.deleteUser(body.userId);
    if (error) return fail(error.message, 500);
    return ok({ ok: true });
  }

  return fail("Unknown action");
});
