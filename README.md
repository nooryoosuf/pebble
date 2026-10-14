# Pebble 🪨 — Daily Business Studies · Grade 7

A warm, gamified daily-learning platform built from the approved
*Exploring Business Studies 7* content in this folder.

## What's here

| Path | What it is |
|---|---|
| `app/` | The React + TypeScript + Vite application |
| `chapter_*_content_file.md` | Approved per-chapter content (notes, flashcards, MCQs, rubrics, challenges) — **source of truth** |
| `curriculum_map_data.md` | Curriculum map with stable IDs (`ch-*`, `top-*`, `lo-*`) + textbook pages |
| `achievements_and_milestones.md` | Milestones (`ms-*`) + special badges (`bdg-*`) |
| `mcq_question_bank_csv_export.md` | MCQ export (same IDs as chapters) |
| `exploring_business_studies_7_complete_lesson_notes.md` | Full lesson notes behind the Learn step |
| `704639358-Exploring-Business-Studies-SB7.pdf` | Printed textbook (verification) |

## Quick start (demo mode — no keys needed)

```powershell
cd app
npm.cmd install
npm.cmd run dev
```

Open the printed URL (usually http://localhost:5173). Pick a name on **Start**,
work through **Today's pebble** (Learn → Review → Practice → Results), revisit
anything from **Journey**, try the **Challenge**, and open the **Parent** area
for real-activity reports. Progress saves in `localStorage`; a banner says
*Demo mode* until Supabase is configured.

## Supabase setup (optional sync + auth)

1. Create a project at https://supabase.com, then run
   `app/supabase/migrations/001_pebble_schema.sql` in the SQL editor.
   It creates `profiles`, `parent_links`, `answer_keys`, `attempts`,
   `objective_mastery`, `earned_badges`, `study_days`, enables RLS, and adds a
   `grade_attempt` trigger so **scores/XP/bands are computed server-side** —
   client-submitted scores are ignored.
2. Copy `app/.env.example` to `app/.env` and fill in:
   `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (anon key only — never the
   service_role secret).
3. Restart the dev server. The demo banner disappears when keys are detected.

Seed the `answer_keys` table with the IDs in the migration (already included);
they mirror the chapter content files exactly.

## Architecture

- **Frontend:** React 19 + TS + Tailwind v4, `react-router-dom`, framer-motion,
  lucide icons, hand-rolled shadcn-style UI (`app/src/components/ui.tsx`).
- **Data:** `app/src/data/curriculum.ts` — 4 chapters → 12 topic-lessons with
  preserved IDs + page refs; flashcards, MCQs, true/false, rubric short answers,
  business scenarios, misconceptions, milestones.
- **State:** `app/src/lib/store.tsx` — attempts, XP (participation + performance),
  streaks, **mastery tracked separately** (≥80% across 2+ attempts per objective;
  clicking through can't fake it), badges, goals, adaptive revision.
- **Backend:** Supabase Postgres + RLS (students see own rows; parents see only
  linked students). Demo fallback = clearly labelled localStorage mode.

## Credits

- World illustrations: [unDraw](https://undraw.co) scenes by Katerina
  Limpitsouni (free for commercial use), vendored via the MIT-licensed
  [`react-undraw-illustrations`](https://github.com/GraemeFulton/react-undraw-illustrations)
  package and tinted to each world's palette (`app/src/assets/illustrations/`).

## Key flows to test

1. Start → Dashboard shows today's lesson, streak, XP, badges.
2. Lesson: Learn → flip flashcards → answer all practice Qs → Results with
   explanations → XP + mastery update → retry changes best score.
3. Score <50% suggests guided revision; 50–79% practice; 80%+ progress.
4. Parent dashboard shows only recorded attempts (empty state if none).
5. `npm.cmd run build` passes.
