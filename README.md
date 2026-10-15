# Pebble 🪨 — Daily Business Studies · Grade 7

A playful, installable daily-learning platform built from the approved
*Exploring Business Studies 7* content in this folder. Each family member has
their own login; students learn, parents follow — every family sees only their
own data.

**Live:** https://pebble.nooryoosuf.com (Cloudflare Pages + custom domain, Supabase backend connected)
**Also:** https://nooryoosuf.github.io/pebble (GitHub Pages mirror)
**Repo:** https://github.com/nooryoosuf/pebble

## What's here

| Path | What it is |
|---|---|
| `app/` | The React + TypeScript + Vite application (PWA) |
| `app/src/data/curriculum.ts` | 12 topic-lessons + Master capstone, stable IDs, textbook page refs |
| `app/supabase/migrations/` | `001` core schema + RLS + server grading · `002` capstone keys · `003` multi-family auth · `004` challenge days · `005` admin console · `006` challenge results · `007` family profiles · `008` orphan purge |
| `app/supabase/functions/create-student/` | Edge Function: (legacy) parents create linked child logins |
| `app/supabase/functions/admin-users/` | Edge Function: owner-only login list, password reset, delete |
| `chapter_*_content_file.md`, `curriculum_map_data.md`, … | Approved source content (source of truth) |
| `704639358-Exploring-Business-Studies-SB7.pdf` | Printed textbook (verification) |

## How accounts work (multi-family)

- **One parent login per family.** Parents sign up with email + password, then
  add a **profile per child — just a name, no email or password for kids**.
  Children learn on the family device(s) under the parent's sign-in by picking
  their profile (older `create-student` email logins still work if they exist).
- **Students** with their own login (legacy) get missions, streaks, medals.
  Progress saves to the learner's record and syncs across devices (offline work
  is cached and uploaded later). Deleting a profile wipes its learning data
  (app + database trigger safety net).
- **Isolation:** Supabase Row Level Security guarantees each family sees only
  its own rows — verified live (second family reads nothing, cross-family
  writes rejected). Roles are assigned at signup and locked — a student can
  never promote themselves. Answer keys and grading live server-side
  (`grade_attempt` trigger); the app never trusts client scores.

## Backend setup (once, ~15 min)

1. Create a project at https://supabase.com → copy the **Project URL** and **anon key**.
2. **SQL editor** → run `app/supabase/migrations/001_pebble_schema.sql`, then `002`, `003`, `004` in order.
3. **Authentication → Sign In / Providers → Email**: enable it. For classroom simplicity you may **turn off “Confirm email”** so new logins work immediately.
4. **Edge Functions**: deploy the child-creator and give it the secret key —
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy create-student --no-verify-jwt
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   (Dashboard → Project Settings → API for the service_role key. It never goes in the app.)
5. Copy `app/.env.example` to `app/.env`, fill in the URL + anon key, restart.

## Hosting on Cloudflare Pages + your subdomain

1. Push this repo to GitHub (already at `nooryoosuf/pebble`).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**:
   - Project name: `pebble` · Framework preset: **Vite**
   - Build command: `npm run build` · Output directory: `app/dist`
   - **Root directory: `app`** (so `package.json` is found)
   - Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. **Custom domain**: Pages project → Custom domains → *Set up a custom domain* → enter e.g. `pebble.yourdomain.com`. If your domain already uses Cloudflare DNS this is one click; otherwise add the shown `CNAME` at your registrar.
4. SPA routing works via `app/public/_redirects` (`/* /index.html 200`); HTTPS is automatic.

## Install as an app (PWA)

The build ships a manifest + service worker (auto-updating): on Android (Chrome) use *⋮ → Add to Home screen / Install app*; on iPhone (Safari) use *Share → Add to Home Screen*. App shell, illustrations and fonts keep working offline; lesson progress made offline syncs when back online.

## Local development

```powershell
cd app
npm.cmd install
Copy-Item .env.example .env   # then fill in real Supabase keys
npm.cmd run dev               # http://localhost:5173/
```

Without keys the app boots to a “Backend not connected” state instead of fake data — add keys to develop the full flow.

## Key flows to test

1. Parent sign-up → parent area → add a child **profile** (name only) → pick the profile → complete a lesson.
2. Parent report shows the child's real attempts, written report, and working goal setter.
3. A second family signing up sees none of the first family's data.
4. `npm.cmd run build` passes; `app/dist` contains `manifest.webmanifest`, `sw.js`, `_redirects`.

## Admin console (owner-only platform stats)

The app has an **Admin** area (`/admin`, revealed in nav + profile only for admins)
showing live platform numbers — families, students, attempts, active users,
average score, XP, badges, master clears, 14-day activity, a per-family table,
and the latest activity feed. Everything comes from real rows via the
`admin_overview` RPC; locked rows stay locked for everyone else.

To make yourself admin (after signing up as a parent on the live site):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';
```

Run it in Supabase → SQL Editor. Reload the app — the Admin tab appears. Nobody
can grant this to themselves: the table is writable only with the service key.

The console's **Logins & access** section lists every account (name, role,
email, children, last sign-in) with search, **password reset**, and **delete**
— all enforced by the owner-only `admin-users` Edge Function (deployed with
`supabase functions deploy admin-users --no-verify-jwt`).

## Credits

- World illustrations: [unDraw](https://undraw.co) scenes by Katerina Limpitsouni (free for commercial use), vendored via the MIT-licensed [`react-undraw-illustrations`](https://github.com/GraemeFulton/react-undraw-illustrations) package (`app/src/assets/illustrations/`).
