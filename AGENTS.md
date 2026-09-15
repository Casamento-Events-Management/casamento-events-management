# Casamento Events Web Platform — Agent Workspace Rules

## 1. Core Tech Stack
- **Framework**: Next.js 15+ (App Router, React Server Components by default)
- **Language**: TypeScript (Strict mode enabled, no `any`, explicit return types for public helpers)
- **Styling**: Tailwind CSS (Mobile-first, standard breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`)
- **CMS**: Sanity.io (`next-sanity` v9+)
- **Database & Auth**: Supabase (`@supabase/ssr`)
- **Email**: Resend / React-Email (Fallback: EmailJS)
- **Validation**: Zod schemas for all forms, environment variables, and API payloads
- **Icons**: Lucide React

---

## 2. Architectural Guardrails & Security
- **Private Key Isolation**: NEVER expose private secrets (`SUPABASE_SERVICE_ROLE_KEY`, `DRAGONPAY_SECRET`, `RESEND_API_KEY`) in client-side code or exported public configurations.
- **Component Boundaries**: Mark interactive components explicitly with `'use client'`. Keep interactive elements isolated to leaf nodes; keep parent wrappers as Server Components to maximize hydration performance and SEO.
- **Video & Media Policy (SEO & Performance Optimized)**:
  - Videos must **NOT** autoplay directly.
  - Users must interact (click) to play videos.
  - An optimized video thumbnail/poster image MUST be displayed before playback to boost SEO, improve Largest Contentful Paint (LCP), and enhance Core Web Vitals.
  - Stream videos from Sanity CDN, Cloudflare Stream, or optimized WebM/MP4 sources. Never load uncompressed 4K video assets directly from Git repositories.
- **API Route Security**: Every public or state-changing API route MUST:
  1. Validate payload input with Zod.
  2. Verify Google reCAPTCHA v3 score (`> 0.5`) prior to sending emails or initiating payment workflows.

---

## 3. Next.js SEO Expertise & Best Practices
- **Metadata API**: Use dynamic and static `generateMetadata` for all public routes (title tags, meta descriptions, OpenGraph images, Twitter cards, and canonical URLs).
- **Structured Data (JSON-LD)**: Inject rich JSON-LD snippets (`schema.org`) for Events, Articles/Vlogs, VideoObject, and Organization schemas.
- **Semantic HTML Hierarchy**: Maintain a clean HTML structure with a single `<h1>` per page, alongside proper landmark tags (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<footer>`).
- **Dynamic Sitemaps & Robots**: Maintain dynamic `sitemap.ts` and `robots.ts` using Next.js file-based metadata routes.
- **Core Web Vitals**:
  - Always use `next/image` with appropriate `sizes` attributes, lazy loading for below-the-fold assets, and explicit dimensions to avoid Layout Shift (CLS).
  - Preload key image assets and thumbnails.

---

## 4. Architecture & Coding Patterns (Highly Modular Code)
- **Single Responsibility Principle (SRP)**: Each component, service, or helper function must have one concise responsibility.
- **Feature-Based Modular Structure**: Group related components, services, types, and hooks by feature domain.
- **Decoupled Service Layer**: Keep business logic, third-party API clients, database queries, and payment processing isolated in dedicated service modules (e.g., `lib/services/`).
- **UI Primitives**: Isolate atomic reusable primitives in `components/ui`.

---

## 5. Agent Workflow Rules
- Always inspect existing reusable primitives in `components/ui` before creating new UI components.
- Execute `pnpm lint` and `pnpm typecheck` after every multi-file edit to ensure zero type or lint regressions.
- Keep Git commit messages atomic using conventional standards: `feat:`, `fix:`, `refactor:`, `chore:`.

---

## 6. Vercel Free-Tier (Hobby) Constraints & Cost Optimization
- **Static First & Incremental Static Regeneration (ISR)**:
  - Default to static rendering (`revalidate` tag or time-based ISR) and Server Components over dynamic serverless API routes.
  - Cache Sanity CMS queries using `next-sanity` caching (`revalidate: 3600` or tag-based revalidation) so Vercel Edge serves cached static pages without triggering serverless function executions.
- **Serverless Function Execution Limits**:
  - Keep route handlers and Server Actions fast and lightweight (< 10s execution max limit).
  - Do NOT call internal API routes (`fetch('/api/...')`) from inside Server Components; query database or service layers directly to avoid double serverless function invocations.
  - Consolidate data fetching to minimize the total count of serverless function calls per user session.
- **External CDN & Bandwidth Protection**:
  - Deliver videos and heavy media strictly via external CDNs (Sanity CDN, Cloudflare Stream, YouTube/Vimeo). **NEVER** proxy raw video streams or large media files through Next.js API routes or Vercel serverless functions.
  - Configure `images.remotePatterns` in `next.config.js` for Sanity CDN and Supabase Storage to optimize images efficiently without hitting Vercel image optimization limits.
- **Database Connection Pooling**:
  - Use Supabase `@supabase/ssr` with Supabase connection pooler (Transaction mode) in serverless contexts to prevent connection exhaustion and function timeouts.
