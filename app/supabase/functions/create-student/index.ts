// Pebble · create-student Edge Function
// Lets a signed-in PARENT create a linked student login (child accounts can't
// sign themselves up in a way that auto-links). The service_role key stays
// server-side — it must be set as a function secret, never shipped to the app.
//
// Deploy:  supabase functions deploy create-student --no-verify-jwt
// Secrets: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... (dashboard: Edge Functions → Secrets)

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
// NOTE: the CLI refuses SUPABASE_-prefixed secret names, so the service key
// is stored as SERVICE_ROLE_KEY (dashboard-set SUPABASE_SERVICE_ROLE_KEY
// also works via the fallback).
const SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
if (!SERVICE_KEY) throw new Error("Missing SERVICE_ROLE_KEY function secret");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return Response.json({ error: "POST only" }, { status: 405, headers: cors });
  }

  // Who is calling? Must be an authenticated parent.
  const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await callerClient.auth.getUser();
  if (!user) return Response.json({ error: "Sign in first" }, { status: 401, headers: cors });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: callerProfile } = await admin
    .from("profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "parent") {
    return Response.json({ error: "Only parent accounts can add children" }, { status: 403, headers: cors });
  }

  let body: { displayName?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: cors });
  }
  const displayName = (body.displayName ?? "").trim().slice(0, 40);
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (displayName.length < 2) return Response.json({ error: "Give your child a display name" }, { status: 400, headers: cors });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Enter a valid email for your child (you can use youremail+child@gmail.com)" }, { status: 400, headers: cors });
  if (password.length < 8) return Response.json({ error: "Choose a password of at least 8 characters" }, { status: 400, headers: cors });

  // Create the auth user (email pre-confirmed so the child can sign straight in).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName, role: "student" },
  });
  if (createErr || !created.user) {
    return Response.json({ error: createErr?.message ?? "Could not create the student login" }, { status: 400, headers: cors });
  }

  // Profile row (trigger usually handles this; upsert to be safe) + link.
  await admin.from("profiles").upsert(
    { id: created.user.id, display_name: displayName, role: "student" },
    { onConflict: "id" },
  );
  const { error: linkErr } = await admin.from("parent_links").insert({
    parent_id: user.id,
    student_id: created.user.id,
  });
  if (linkErr) {
    return Response.json({ error: "Account created but linking failed: " + linkErr.message }, { status: 500, headers: cors });
  }

  return Response.json(
    { studentId: created.user.id, email, displayName },
    { headers: cors },
  );
});
