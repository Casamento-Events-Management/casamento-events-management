/**
 * scripts/seeders/helpers.ts
 *
 * Shared utilities for Sanity seed scripts:
 * - Sanity write client factory
 * - Image upload helper (fetches from URL → uploads to Sanity asset store)
 * - Key generator for Sanity array items
 */

import { createClient } from '@sanity/client'

// ---------------------------------------------------------------------------
// Sanity Write Client
// ---------------------------------------------------------------------------

export function createWriteClient() {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
    const token = process.env.SANITY_API_WRITE_TOKEN

    if (!projectId) throw new Error('Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID')
    if (!dataset) throw new Error('Missing env: NEXT_PUBLIC_SANITY_DATASET')
    if (!token) throw new Error('Missing env: SANITY_API_WRITE_TOKEN')

    return createClient({
        projectId,
        dataset,
        token,
        apiVersion: '2026-09-19',
        useCdn: false,
    })
}

// ---------------------------------------------------------------------------
// Image Asset Upload
// ---------------------------------------------------------------------------

type SanityAssetRef = { _type: 'reference'; _ref: string }

/**
 * Downloads an image from a URL and uploads it to Sanity's asset store.
 * Returns a Sanity reference object pointing to the uploaded asset.
 *
 * Falls back to a placeholder reference if the upload fails (e.g. broken URL in mock).
 */
export async function uploadImageFromUrl(
    client: ReturnType<typeof createWriteClient>,
    url: string,
    filename: string,
    dryRun: boolean,
    retries = 3,
): Promise<SanityAssetRef | null> {
    if (dryRun) {
        console.log(`  [dry-run] Would upload image: ${url}`)
        return { _type: 'reference', _ref: `dry-run-image-ref-${filename}` }
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            const contentType = response.headers.get('content-type') ?? 'image/jpeg'
            const arrayBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const asset = await client.assets.upload('image', buffer, {
                filename,
                contentType,
            })

            console.log(`  ✓ Uploaded image asset: ${asset._id} (${filename})`)
            return { _type: 'reference', _ref: asset._id }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            if (attempt < retries) {
                console.warn(`  ⚠ Attempt ${attempt} failed for ${url} (${message}), retrying...`)
                await new Promise((resolve) => setTimeout(resolve, 1000))
            } else {
                console.warn(`  ❌ Failed to upload image from ${url} after ${retries} attempts: ${message}`)
            }
        }
    }

    return null
}

// ---------------------------------------------------------------------------
// Array Key Generator
// ---------------------------------------------------------------------------

/** Generates a stable 12-char key for Sanity array items. */
export function generateKey(seed: string): string {
    let hash = 5381
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 33) ^ seed.charCodeAt(i)
    }
    return Math.abs(hash).toString(36).substring(0, 12)
}
