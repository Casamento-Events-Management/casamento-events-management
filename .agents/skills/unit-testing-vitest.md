# Skill: Unit Testing with Vitest

## Scope & Target Files
Apply when creating or modifying:
- Functions in `src/lib/` (data-access layer, e.g. `getPortfolioItems()`, `getServices()`)
- Zod schemas (`src/lib/schemas/`)
- Utilities (`src/lib/utils/`)
- Pure business logic not tied to rendering UI or browser I/O

## Stack & Location
- Runner: **Vitest** (`expect`, `vi.mock()`)
- Location: Co-located `*.test.ts` next to the source file (e.g. `src/lib/content.ts` → `src/lib/content.test.ts`). Do NOT use `__tests__/`.

## Conventions
1. **File Mapping**: Exactly one test file per source file.
2. **Structure**: `describe()` per export, `it()` per behavior with descriptive sentence naming.
3. **Data-Access Tests**: Verify returned data shapes against `src/types/` interfaces and graceful handling of empty/missing data (`[]` or `null`). Do not assert on specific fixture values.
4. **Zod Schema Tests**: Assert on pass/fail for valid inputs and project-specific validation rules.
5. **Isolation**: No network, filesystem, or env secrets. Mock client boundaries (`vi.mock()`) if necessary.

## Commands
- Run once: `npm test`
- Watch: `npm test:watch`
- Coverage: `npm test:coverage`

## Workflow Rule
Generate or update the matching `.test.ts` file in the same change whenever source files in `src/lib/` are created or modified.

## Out of Scope
- UI component rendering tests & browser automation
- E2E concerns (booking flows, email delivery, webhooks)
