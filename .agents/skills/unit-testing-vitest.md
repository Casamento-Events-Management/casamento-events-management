# Skill: Unit Testing with Vitest

## When to use this skill
Apply this whenever creating or modifying:
- Functions in `src/lib/` (data-access layer, e.g. `getPortfolioItems()`, `getServices()`)
- Zod schemas (`src/lib/schemas/`)
- Utility/helper functions (`src/lib/utils/`)
- Any pure business logic NOT tied to rendering UI or browser interaction

Do NOT use this skill for booking-flow, email-delivery, or payment-webhook verification —
those are end-to-end concerns. See `e2e-booking-flow-playwright.md`.

## Stack
- Test runner: **Vitest** (not Jest)
- Assertions: Vitest's built-in `expect` (Jest-compatible API)
- Location: co-located `*.test.ts` files next to the code under test
  (e.g. `src/lib/content.ts` → `src/lib/content.test.ts`)
- Do NOT create a separate top-level `__tests__/` directory — co-location keeps
  tests discoverable and forces updates when source changes.

## Required conventions
1. **One test file per source file.** Match the filename exactly
   (`schemas/booking.ts` → `schemas/booking.test.ts`).
2. **Test structure**: use `describe()` per exported function/schema,
   `it()` per behavior — not per input value. Group edge cases inside one `it`
   with multiple assertions only when they test the same behavior.
3. **What to test for data-access functions** (`src/lib/content.ts` style):
   - Returns correctly-shaped data matching the corresponding `src/types/` interface
   - Handles empty/missing data gracefully (returns `[]` or `null`, never throws
     on absence of data)
   - Does NOT test the mock data's actual content values — test shape and
     behavior, not fixture data. This matters because mock data will be replaced
     by Sanity later; content-value tests will break for the wrong reason.
4. **What to test for Zod schemas**:
   - At least one valid-input pass case
   - At least one case per validation rule (required field missing, wrong type,
     out-of-range, etc.) — assert on `.success` and relevant `.error.issues`
   - Do NOT test Zod's own internals (e.g., don't re-test that `.min()` works —
     only test that YOUR schema's rules produce the right pass/fail for this
     project's actual fields).
5. **No network, no filesystem, no environment secrets in unit tests.** If a
   function under test needs Supabase/Sanity/Resend, either:
   - It's not a unit test candidate — the function isn't sufficiently isolated
     from I/O, or
   - Mock the client at the module boundary (Vitest `vi.mock()`), never make
     a real call.
6. **Naming**: test descriptions read as a sentence:
   `it('returns an empty array when no portfolio items exist', ...)` —
   not `it('test 1', ...)`.

## Commands
- Run once: `pnpm test`
- Watch mode during active development: `pnpm test:watch`
- Coverage: `pnpm test:coverage` (target: meaningful coverage of `lib/`,
  not a percentage mandate — don't pad coverage with trivial tests)

## Agent workflow rule
After generating or modifying any file in `src/lib/`, generate or update its
matching `.test.ts` file in the same commit/change — do not treat tests as a
separate follow-up task unless explicitly told to skip them for a given prompt
(e.g., during rapid Phase 1 scaffolding iteration).

## Explicitly out of scope for this skill
- Component/UI rendering tests (not covered yet — revisit if needed post-Phase 1)
- Any test requiring a running dev server or browser context
- E2E/booking/payment/email verification (→ `e2e-booking-flow-playwright.md`)

## NOTE
- `e2e-booking-flow-playwright.md` MAY currently not implemeted as of this phase but still adhere to the above prompts.