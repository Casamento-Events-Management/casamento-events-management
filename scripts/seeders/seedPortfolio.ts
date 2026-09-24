/**
 * scripts/seeders/seedPortfolio.ts
 *
 * Transforms MOCK_PORTFOLIO_CATEGORIES and MOCK_PORTFOLIO_ITEMS from
 * src/data/portfolioMock.ts into Sanity `portfolioCategory` and `portfolioItem`
 * documents, then upserts them using createOrReplace.
 *
 * Order:
 *   1. Categories first (so item references resolve correctly)
 *   2. Items with category reference (_ref pointing to category _id)
 */

import { MOCK_MEDIA_CATEGORIES, MOCK_PORTFOLIO_HERO, MOCK_PORTFOLIO_ITEMS } from '../../src/data/portfolioMock'
import { createWriteClient, generateKey, uploadImageFromUrl } from './helpers'

export async function seedPortfolio(dryRun: boolean): Promise<void> {
    const client = createWriteClient()

    // ── 0. Seed Portfolio Hero Singleton ─────────────────────────────────────
    console.log('\n🌟 Seeding portfolioHero singleton...\n')
    const heroDoc = {
        _id: 'portfolioHero',
        _type: 'portfolioHero',
        ...MOCK_PORTFOLIO_HERO,
    }

    if (dryRun) {
        console.log('[dry-run] Would upsert portfolioHero:')
        console.log(JSON.stringify(heroDoc, null, 2))
    } else {
        await client.delete('drafts.portfolioHero').catch(() => { })
        await client.createOrReplace(heroDoc)
        console.log(`  ✓ Upserted portfolioHero singleton (id: portfolioHero)`)
    }

    // ── 1. Seed Media Categories (Portfolio & Article Vlogs) ────────────────
    console.log('\n📁 Seeding Media Categories (portfolioCategory)... \n')

    const categoryDocuments = MOCK_MEDIA_CATEGORIES.map((cat) => ({
        _id: cat.id || cat._id || `cat-${cat.slug}`,
        _type: 'portfolioCategory',
        title: cat.title,
        slug: { _type: 'slug', current: cat.slug },
        description: cat.description,
        priority: cat.priority,
    }))

    if (dryRun) {
        console.log('[dry-run] Would upsert portfolio categories:')
        console.log(JSON.stringify(categoryDocuments, null, 2))
    } else {
        for (const doc of categoryDocuments) {
            await client.delete(`drafts.${doc._id}`).catch(() => { })
            await client.createOrReplace(doc)
            console.log(`  ✓ Upserted category: ${doc.title} (id: ${doc._id})`)
        }
    }

    // ── 2. Seed Portfolio Items ──────────────────────────────────────────────
    console.log('\n🖼  Seeding portfolioItem documents...\n')

    // Build a slug → _id map from mock categories for category reference resolution
    const categoryIdBySlug = Object.fromEntries(
        MOCK_MEDIA_CATEGORIES.map((cat) => [cat.slug, cat.id || cat._id || `cat-${cat.slug}`]),
    )

    for (const item of MOCK_PORTFOLIO_ITEMS) {
        console.log(`▸ Processing: "${item.title}"`)

        // Upload thumbnail image
        const thumbnailRef = await uploadImageFromUrl(
            client,
            item.thumbnail.url,
            `portfolio-thumb-${item.slug}.jpg`,
            dryRun,
        )

        // Resolve category reference
        const categoryId = categoryIdBySlug[item.category.slug]
        if (!categoryId) {
            console.warn(`  ⚠ Could not resolve category slug "${item.category.slug}" — skipping item.`)
            continue
        }

        // Build video source (if applicable)
        let videoField: object | undefined
        if (item.video) {
            const vid = item.video
            videoField = {
                _type: 'videoSource',
                sourceType: vid._type,
                ...(vid._type === 'external'
                    ? { url: vid.url, provider: vid.provider }
                    : {
                        mimeType: (vid as { mimeType?: string }).mimeType,
                    }),
            }
        }

        const document: { _id: string; _type: string;[key: string]: unknown } = {
            _id: item.id,
            _type: 'portfolioItem',
            title: item.title,
            slug: { _type: 'slug', current: item.slug },
            category: {
                _type: 'reference',
                _ref: categoryId,
            },
            mediaType: item.mediaType,
            tags: item.tags ?? [],
            description: item.description,
            eventDate: item.eventDate,
            location: item.location,
            clientName: item.clientName,
            featured: item.featured,
            priority: item.priority,
            ...(thumbnailRef && {
                thumbnail: {
                    _type: 'sanityImageWithPriority',
                    asset: thumbnailRef,
                    alt: item.thumbnail.alt,
                    caption: item.thumbnail.caption,
                    priority: item.priority,
                },
            }),
            ...(videoField && { video: videoField }),
        }

        // _key is used for the item if embedded in arrays; not needed for top-level docs
        // but we generate one anyway for consistency
        void generateKey(item.id)

        if (dryRun) {
            console.log('[dry-run] Would upsert:')
            console.log(JSON.stringify(document, null, 2))
        } else {
            await client.delete(`drafts.${item.id}`).catch(() => { })
            await client.createOrReplace(document)
            console.log(`  ✅ Upserted portfolioItem: ${item.title} (id: ${item.id})`)
        }
    }

    if (!dryRun) {
        console.log(
            `\n✅ Portfolio seeding complete — ${MOCK_MEDIA_CATEGORIES.length} categories, ${MOCK_PORTFOLIO_ITEMS.length} items.`,
        )
    }
}
