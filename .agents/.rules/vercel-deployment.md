# Rule: Vercel Deployment Constraints

## Enforcement level
MANDATORY. Unlike skills (applied when task-relevant), this file's
constraints apply to every change touching `src/app/api/**/route.ts`,
`next.config.ts`, or any deployment-relevant surface — no exceptions
without explicit user override in chat for that specific task.

---

## 1. Serverless Function Consolidation (src/app/api/**)

All API routes live under `src/app/api/`. Functions must be grouped by
**domain**, not by individual action.

- One route domain = one folder = one logical area of responsibility.
  Example domains for this project: `booking`, `payment-webhook`,
  `feedback`, `newsletter` (adjust as real domains emerge — do not invent
  domains speculatively).
- Within a domain folder, consolidate related actions into a single
  `route.ts` using HTTP method branching (`POST`, `PATCH`, etc.) or a
  shared handler with an internal action discriminator, rather than
  creating a new subfolder/route per action.
- **Before creating any new file under `src/app/api/`**, check whether an
  existing domain folder can absorb the new endpoint. Creating a new
  top-level domain folder requires the new capability to be genuinely
  unrelated to all existing domains — not just "easier to keep separate."
- Do NOT create a route per CRUD verb (e.g. no `api/booking/create/`,
  `api/booking/update/` as separate folders) — one `api/booking/route.ts`
  handling multiple methods is correct.
- Target: minimize total function count across the project. Every new
  top-level folder under `src/app/api/` is a new serverless function on
  Vercel — treat adding one as a deliberate, justified decision, not a
  default.

## 2. next.config.ts — Mandatory Review Checklist

Any change that adds/modifies a Route Handler, external domain, embed,
image source, or redirect MUST be accompanied by a review of
`next.config.ts` against this checklist in the SAME task/change —
never deferred to a follow-up:

- [ ] `images.remotePatterns` includes only domains actually in use
      (Sanity CDN, Supabase Storage) — no wildcard/overly broad patterns
- [ ] Security headers configured via `headers()`: at minimum
      `Content-Security-Policy`, `X-Frame-Options` or `frame-ancestors`,
      `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
      `Strict-Transport-Security`
- [ ] No secrets, internal URLs, or debug flags hardcoded in config
- [ ] Client-exposed env values contain only what's genuinely safe
      (never service role keys, payment secrets — cross-check AGENTS.md
      Section 2)
- [ ] Redirects/rewrites are intentional and documented, not leftover
      from scaffolding/testing
- [ ] Any new third-party script/embed domain is reflected in CSP, not
      just added ad hoc in a component

## 3. Mandatory Reporting

- Every response that touches `src/app/api/**` or `next.config.ts` MUST
  explicitly state, at the end of the change: which checklist items in
  Section 2 were reviewed, and their outcome (pass / updated / N/A).
- Silently skipping this report is treated as an incomplete task, even if
  the code itself is otherwise correct.
- If a new domain folder is created under `src/app/api/`, the response
  MUST state why an existing domain could not absorb it.

## 4. Runtime & Execution Discipline

- Default runtime: Node.js. Edge runtime requires explicit justification
  (stated in the route file and in the response) — do not select Edge by
  default for "performance."
- Runtime must be explicitly declared in every route file
  (`export const runtime = 'nodejs' | 'edge'`), never left implicit.
- No long-running synchronous work, unbounded loops, or unproxied large
  media in any Route Handler. Target well under Vercel's execution cap —
  see AGENTS.md Section 6 for the free-tier cost rationale.

---

## Relationship to other files

Priority chain: **AGENTS.md > this file > skills/vercel-deployment.md**.

- **Why** these constraints exist (cost/free-tier rationale) → AGENTS.md Section 6.
- **When** to apply deployment discipline (task-trigger guidance) → `.agents/skills/vercel-deployment.md`.
- **This file** is the non-negotiable enforcement layer. If AGENTS.md, the skill, or any other
  file conflicts with this file, this file wins — escalate to the user if genuinely ambiguous.