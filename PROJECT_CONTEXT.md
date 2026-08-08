# PROJECT CONTEXT & ARCHITECTURE OVERVIEW

## Application Identity
- **Project Name:** CoachOS (Antigravity)
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS, PostCSS
- **Key Domain:** Educational management portal (Admin, Tutor, Parent, Student tracking)

## Essential Directory Mapping
- `src/app/`: Next.js App Router layout, page views, and API routes (`src/app/api/`).
- `src/components/`: Modular React components (Dashboards, forms, navigation).
- `src/lib/`: Core business logic, authentication handlers, DB schemas, and utilities.
- `scripts/`: Cron jobs, seed scripts, and notification runners.

## Context for the AI
- `node_modules` and `.env` secrets have been intentionally excluded.
- Refer to `package.json` for installed dependency references.
- Primary type references reside in `src/lib/types.ts`.
