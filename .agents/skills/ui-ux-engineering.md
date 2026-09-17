# Skill: Design Tokens & Visual System

## Scope
Applies to every page and component for the lifetime of this project.
Video-specific handling and SEO/Core Web Vitals rules live in AGENTS.md, not here.

## Style Direction
Minimalist & editorial. Generous whitespace, strong type-driven hierarchy over
decorative elements. When in doubt, remove an element rather than add one.

## Color
- Base: light/neutral (e.g. white / near-white / warm-gray background tones)
- Accent: black / near-black ONLY — no secondary brand color, no color pop
- Do not introduce additional hues (no blues, golds, reds) without explicit
  approval — this includes default focus-ring colors, link colors, and
  form-validation colors. Restyle browser defaults to fit the black/neutral
  palette rather than accepting framework/browser defaults.
- Status colors (error/success states in forms) are the one exception where a
  minimal, desaturated red/green may be used — kept as small text/icon accents,
  never large color blocks.

## Typography
- Single sans-serif type family across the entire site — no secondary/display
  font pairing.
- Hierarchy is built through weight, size, and spacing — not multiple typefaces.
- Candidates to choose from (confirm before scaffolding): Inter, Geist.
- Use `next/font` for loading — never a `<link>` tag to Google Fonts directly,
  to preserve self-hosting/performance benefits.

## Spacing & Layout
- Mobile-first Tailwind breakpoints only (`sm`, `md`, `lg`, `xl`, `2xl`) —
  no custom breakpoints unless explicitly justified.
- Prefer Tailwind's default spacing scale; avoid arbitrary values (`mt-[13px]`)
  except for genuinely one-off layout needs.
- Whitespace is a design tool here, not a gap to fill — err toward more
  breathing room, not less, consistent with the editorial style direction.

## Components
- Plain Tailwind utility classes only. No component library (no shadcn/ui,
  no Headless UI/Radix) for this phase of the project.
- Shared/repeated UI (buttons, cards, section headers) still must be extracted
  into `components/ui/` as reusable primitives per AGENTS.md Section 4 —
  "no library" refers to third-party packages, not to code reuse discipline.

## Motion
- CSS-only. No animation libraries (no Framer Motion, no GSAP).
- Allowed: Tailwind `transition`/`duration` utilities for hover/focus states;
  scroll-triggered fade-ins via native `IntersectionObserver`.
- Not allowed: parallax, scroll-jacking, or any animation that blocks/competes
  with main content or media loading.
- Every animation MUST be wrapped to respect
  `@media (prefers-reduced-motion: reduce)` — provide a static/instant
  fallback, never skip this.

## Mock/Placeholder Content Tone
- Realistic, client-voice copy — written as if it were real Casamento Events
  copy (real-sounding headlines, CTAs, event names, testimonials).
- Do NOT use lorem ipsum or obviously fake placeholder text ("Lorem", "Test
  testimonial 1") — the goal is content the client could plausibly approve
  as-is, since this also doubles as a content-direction preview for them.
- Clearly mark data as mock at the SOURCE (e.g. a comment or flag in the mock
  data file itself), not in the visible UI text.

## Non-negotiables (apply regardless of page)
- No secondary accent color, no secondary font, no component library, no
  animation library — these are project-wide constraints, not
  Home-page-specific choices.