// =============================================================================
// lib/schemas/zod.ts — CSP-Safe Zod v4 Entrypoint
//
// Disables Zod v4's JIT `new Function("")` probe globally before any schema is
// constructed so strict production CSP (without `'unsafe-eval'`) never logs
// `script-src` violation errors in client bundles.
// =============================================================================

import { z } from 'zod';

z.config({ jitless: true });

export { z };
