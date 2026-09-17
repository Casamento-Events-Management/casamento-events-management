"DEPRECATED once Sanity integration implemented"

# Skill: UI Scaffolding (Phase 1 — Pre-Sanity)

## Status & Scope
TEMPORARY. Covers scaffolding page UI against static mock data (`src/data/mock.ts`) before Sanity CMS integration.
- Refer to `skills/ui-ux-engineering.md` for design system rules.
- Refer to AGENTS.md for architecture, Server Component boundaries, and UI primitives.

## Data Access Rules
- Consume data only through the data-access layer (`src/lib/content.ts` or equivalent) — never import directly from `src/data/mock.ts` inside page/component files.
- Treat mock data (`src/data/mock.ts`) and TypeScript interfaces (`src/types/`) as read-only during scaffolding. Restructuring data is a separate explicit task.

## Scaffolding Execution
- Build page layout and section composition using mock data via the data-access layer.
- Follow Server Components and UI primitive rules in AGENTS.md.
- Responsive mobile-first layout per `skills/ui-ux-engineering.md`.

## Task Parameters (Set by User per Prompt)
- Target page/section
- Section order and content emphasis
- Task type (initial build, types, revision, or fix)

