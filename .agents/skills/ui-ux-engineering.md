# Skill: Design Tokens & Visual System

## Scope
Applies to UI/UX styling. See AGENTS.md for core tech stack, video/media policy, and SEO/Core Web Vitals rules.

## Style Direction
Minimalist & editorial. Generous whitespace, strong type-driven hierarchy over decorative elements.

## Color
- Base: warm cream/beige (`#F7F3E8`) — site's dominant surface color. vibrant but
  elegant feel without relying on saturated color.
- Primary accent: deep olive green (`#3A4F1C`) — used for primary text
  emphasis, nav/footer elements, and key UI accents (links, active states).
- Secondary accent: warm gold (`#BC6F07`) — used SPARINGLY: small accents,
  hover/focus highlights, dividers, icon accents, CTA button borders/hover
  states. Not for large fills or backgrounds.
- Both green and gold remain accents against the cream base — per approved
  direction, this stays restrained/editorial, not decorative. Neither color
  should dominate a section; cream carries the visual weight.
- Text: near-black or deep olive (`#3A4F1C`) for body copy — avoid pure
  black (`#000000`) now that the palette is warm-toned; pure black will
  visually clash with cream/gold.
- Status colors: minimal, desaturated red/green for form errors/success —
  unchanged from prior direction, kept distinct from the brand green above
  (use a clearly different, muted red/green pairing so success states don't
  get confused with brand-green UI elements).

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
