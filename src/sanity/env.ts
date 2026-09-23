export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-19'

// Fall back to safe local placeholder values so the app can still boot in dev/test
// without a real Sanity project configured. Set real values in .env.local for live data.
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo-project-id'
