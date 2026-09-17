"DEPRECATED once Sanity integration implemented"

# Skill: UI Scaffolding (Phase 1 — Pre-Sanity)

## Status
TEMPORARY. This skill governs how pages are scaffolded using static mock data
before Sanity CMS integration. Deprecate/remove once Sanity is wired in and
pages consume live queries instead of `src/data/mock.ts`.

## Scope
This skill covers HOW to build page UI against existing static mock data.
It does NOT define:
- The visual/design system → see `skills/ui-ux-engineering.md`
- The TypeScript types or mock data structure → these are decided and
  implemented separately, already established in `src/types/` and
  `src/data/mock.ts`. This skill assumes that data already exists and is
  correctly shaped.
- Which page or section to build, in what order, or with what content
  emphasis → these specifics are given by the user in chat, per task.

## Reference
Always apply `skills/ui-ux-engineering.md` (color, typography, spacing,
motion, component rules) when scaffolding any page under this skill. Do not
introduce visual decisions here that contradict or duplicate that file —
if a styling question comes up that isn't answered there, stop and ask
rather than deciding it inside a scaffolding task.

## Data Access Rule
- Components/pages MUST consume data only through the data-access layer
  (e.g. functions in `src/lib/content.ts` or equivalent) — never import
  directly from `src/data/mock.ts` inside a page or component file.
- Do not modify the shape of existing types or mock data while scaffolding
  UI. If the UI seems to need a field that doesn't exist yet in the mock
  data/types, stop and flag it — do not invent or restructure the data
  layer as a side effect of building a page.
- Treat the mock data as read-only content for this task. Any change to
  `src/types/` or `src/data/mock.ts` is a separate, explicit task — not an
  implicit part of scaffolding a page's UI.

## What "scaffolding" means here
- Build the page's layout, section structure, and component composition
  using real (mock) data from the data-access layer.
- Server Components by default; `"use client"` only for interactive leaf
  nodes, per AGENTS.md Section 2.
- Reusable pieces (cards, section headers, buttons) go into
  `components/ui/` or a feature folder, per AGENTS.md Section 4 — do not
  build one-off inline markup for anything that repeats across sections
  or pages.
- Responsive by default (mobile-first), per `ui-ux-engineering.md`.

## What this skill does NOT decide
The following are determined per task, by explicit chat instruction from
the user — this skill does not assume or infer them:
- Which page or section is being built in a given task
- The exact section order or inclusion/exclusion of optional sections
- Any content emphasis, copy adjustments, or layout variation requests
  specific to that page
- Whether a given task is a first build, a revision, or a fix

## Explicitly out of scope
- Video/media handling and SEO/Core Web Vitals rules → AGENTS.md
- Sanity query logic, schema design → `skills/sanity-schema-builder.md`
  (not yet applicable during this phase)
- Booking form logic, payment, email → their respective skills
