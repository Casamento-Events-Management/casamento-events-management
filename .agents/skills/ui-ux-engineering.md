# Skill: Design Tokens & Visual System

## Scope
Applies to UI/UX styling. See AGENTS.md for core tech stack, video/media policy, and SEO/Core Web Vitals rules.

## Style Direction
Minimalist & editorial. Generous whitespace, strong type-driven hierarchy over decorative elements.

## Color
- Base: light/neutral (white / near-white / warm-gray)
- Accent: black / near-black ONLY — no secondary brand or pop colors. Restyle browser/framework defaults (focus rings, links, form validation) to fit this palette.
- Status colors: minimal, desaturated red/green for form errors/success states as small text/icon accents only.

## Typography
- Single sans-serif type family (Inter or Geist via `next/font`) across the entire site — no secondary font pairings.
- Hierarchy is built solely through weight, size, and spacing.

## Spacing & Layout
- Use Tailwind default spacing scale and standard mobile-first breakpoints. Avoid arbitrary values unless required for one-off layouts.
- Prioritize generous whitespace consistency with the editorial style.

## Components & Libraries
- Plain Tailwind utility classes only. No third-party component libraries (shadcn/ui, Radix, etc.).
- Extract shared UI elements into `components/ui/` as per AGENTS.md.

## Motion
- CSS-only transitions for hover/focus states and native `IntersectionObserver` for fade-ins.
- No animation libraries (Framer Motion, GSAP), parallax, or scroll-jacking.
- MUST support `@media (prefers-reduced-motion: reduce)` with instant fallbacks.

## Mock Content Tone
- Realistic client-voice copy matching Casamento Events. Do NOT use lorem ipsum.
- Mark mock data at the source file level, not in visible UI text.