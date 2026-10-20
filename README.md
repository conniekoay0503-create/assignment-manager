# University Assignment Manager

A bilingual (English / 简体中文) study workspace for semesters, subjects, assignments, calendar and CGPA.

Plan, data model and phase checklist: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. It redirects to `/en/dashboard`, and `/zh-CN/dashboard` is the Chinese interface.

## Checks

```bash
npm run check
```

This runs the type check, ESLint, Vitest and the production build in order.

## Configuration

Copy `.env.example` to `.env.local`. Nothing needs to be filled in yet: Supabase, Google and AI keys are needed from Phase 3, 9 and 8 onward.
