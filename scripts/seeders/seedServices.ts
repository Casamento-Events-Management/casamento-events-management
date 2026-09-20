/**
 * scripts/seeders/seedServices.ts
 *
 * Transforms MOCK_SERVICE_CATEGORIES and MOCK_SERVICE_ITEMS from
 * src/data/servicesMock.ts into Sanity `servicesHero`, `serviceCategory`,
 * and `serviceItem` documents, then upserts them using createOrReplace.
 *
 * Order:
 *   0. Services Hero Singleton
 *   1. Categories (so item references resolve correctly)
 *   2. Items with category reference (_ref pointing to category _id)
 */

import { MOCK_SERVICE_CATEGORIES, MOCK_SERVICE_ITEMS } from '../../src/data/servicesMock'
import { createWriteClient, generateKey, uploadImageFromUrl } from './helpers'

export async function seedServices(dryRun: boolean): Promise<void> {
    const client = createWriteClient()

    // ── 0. Seed Services Hero Singleton ──────────────────────────────────────
    console.log('\n🌟 Seeding servicesHero singleton...\n')
    const heroDoc = {
        _id: 'servicesHero',
        _type: 'servicesHero',
        title: 'Crafted Experiences, Unforgettable Moments',
        description:
            'From bespoke full wedding planning to technical broadcast production, we deliver immaculate events tailored to your vision.',
    }

    if (dryRun) {
        console.log('[dry-run] Would upsert servicesHero:')
        console.log(JSON.stringify(heroDoc, null, 2))
    } else {
        await client.delete('drafts.servicesHero').catch(() => {})
        await client.createOrReplace(heroDoc)
        console.log(`  ✓ Upserted servicesHero singleton (id: servicesHero)`)
    }

    // ── 1. Seed Service Categories ───────────────────────────────────────────
    console.log('\n📁 Seeding serviceCategory documents...\n')

    const categoryDocuments = MOCK_SERVICE_CATEGORIES.map((cat) => ({
        _id: cat.id,
        _type: 'serviceCategory',
        title: cat.title,
        slug: { _type: 'slug', current: cat.slug },
        description: cat.description,
        icon: cat.icon,
        priority: cat.priority,
    }))

    if (dryRun) {
        console.log('[dry-run] Would upsert service categories:')
        console.log(JSON.stringify(categoryDocuments, null, 2))
    } else {
        for (const doc of categoryDocuments) {
            await client.delete(`drafts.${doc._id}`).catch(() => {})
            await client.createOrReplace(doc)
            console.log(`  ✓ Upserted category: ${doc.title} (id: ${doc._id})`)
        }
    }

    // ── 2. Seed Service Items ────────────────────────────────────────────────
    console.log('\n🛠  Seeding serviceItem documents...\n')

    // Build a slug → _id map from mock categories for category reference resolution
    const categoryIdBySlug = Object.fromEntries(
        MOCK_SERVICE_CATEGORIES.map((cat) => [cat.slug, cat.id]),
    )

    for (const item of MOCK_SERVICE_ITEMS) {
        console.log(`▸ Processing: "${item.title}"`)

        // Resolve category reference
        const categoryId = categoryIdBySlug[item.category.slug]
        if (!categoryId) {
            console.warn(`  ⚠ Could not resolve category slug "${item.category.slug}" — skipping item.`)
            continue
        }

        // Upload images
        const imageObjects = []
        for (let i = 0; i < item.images.length; i++) {
            const img = item.images[i]
            const ref = await uploadImageFromUrl(
                client,
                img.url,
                `service-${item.slug}-${i + 1}.jpg`,
                dryRun,
            )

            if (ref) {
                imageObjects.push({
                    _key: generateKey(`img-${item.id}-${i}`),
                    _type: 'sanityImageWithPriority',
                    asset: ref,
                    alt: img.alt,
                    priority: i === 0 ? 100 : 50,
                })
            }
        }

        // Build add-ons array
        const addOnObjects = (item.addOns || []).map((addon) => ({
            _key: generateKey(`addon-${addon.id}`),
            _type: 'serviceAddOn',
            title: addon.title,
            description: addon.description,
            price: addon.price,
            priceUnit: addon.priceUnit,
        }))

        const document: { _id: string; _type: string; [key: string]: unknown } = {
            _id: item.id,
            _type: 'serviceItem',
            title: item.title,
            slug: { _type: 'slug', current: item.slug },
            category: {
                _type: 'reference',
                _ref: categoryId,
            },
            serviceType: item.serviceType,
            shortDescription: item.shortDescription,
            fullDescription: item.fullDescription,
            images: imageObjects,
            startingPrice: item.startingPrice,
            priceFormatted: item.priceFormatted,
            priceUnit: item.priceUnit,
            defaultInclusions: item.defaultInclusions,
            addOns: addOnObjects,
            badge: item.badge,
            isFeatured: item.isFeatured,
            bookingSlug: item.bookingSlug,
            priority: item.priority,
        }

        if (dryRun) {
            console.log('[dry-run] Would upsert:')
            console.log(JSON.stringify(document, null, 2))
        } else {
            await client.delete(`drafts.${item.id}`).catch(() => {})
            await client.createOrReplace(document)
            console.log(`  ✅ Upserted serviceItem: ${item.title} (id: ${item.id})`)
        }
    }

    if (!dryRun) {
        console.log(
            `\n✅ Services seeding complete — ${MOCK_SERVICE_CATEGORIES.length} categories, ${MOCK_SERVICE_ITEMS.length} items.`,
        )
    }
}
