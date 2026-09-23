# Skill: Vercel Deployment & Serverless Function Discipline

> **Priority chain:** AGENTS.md §6 > `.agents/.rules/vercel-deployment.md` > this file.
> The rules file is the enforcement authority. This skill provides task-trigger guidance and
> workflow reminders; it does not re-state rules already defined above it in the chain.

---

## When to apply this skill

Activate whenever you are:
- Creating or modifying any Route Handler (`src/app/api/**/route.ts`) or Server Action
- Adding, moving, or restructuring API endpoints
- Making any change that could affect build output, function count, or runtime selection
- Reviewing or modifying `next.config.ts`

When this skill is active, also load and follow `.agents/.rules/vercel-deployment.md` in full
before writing any code.

---

## Pre-task checklist (workflow trigger)

Before writing any deployment-relevant code, confirm:

1. **Cost rationale understood** — Re-read AGENTS.md Section 6 to anchor why every decision here matters for the free tier.
2. **Rules loaded** — Load `.agents/.rules/vercel-deployment.md`. All function-grouping rules, the `next.config.ts` checklist, and runtime selection rules live there.
3. **Existing routes audited** — Run a quick scan of `src/app/api/` to understand current domain structure before adding anything new.
4. **Service layer checked** — Confirm the new logic cannot live in a Server Component calling a service directly (avoiding a serverless function entirely).

---

## Workflow reminders

- If a task adds a new external domain, service, or embed, treat updating `next.config.ts`
  (headers / `remotePatterns` / CSP) as part of **that same task**, not a follow-up.
- Never proxy large media through a Route Handler — verify against AGENTS.md §6 CDN/media policy before completing the task.
- After any change touching `src/app/api/**` or `next.config.ts`, append the mandatory
  compliance report to your response as required by `.rules/vercel-deployment.md` Section 3.

---

## Explicitly out of scope for this skill

- Payment webhook–specific logic → `payment-webhook-handler.md`
- Sanity query/schema specifics → `sanity-schema-builder.md`
- Authoritative function-grouping & enforcement rules → `.agents/.rules/vercel-deployment.md`
- Free-tier cost rationale → AGENTS.md Section 6