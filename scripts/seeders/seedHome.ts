/**
 * scripts/seeders/seedHome.ts
 *
 * Transforms `homeMockData` from src/data/homeMock.ts into a Sanity `homePage`
 * singleton document and upserts it using createOrReplace.
 */

import { homeMockData } from '../../src/data/homeMock'
import { createWriteClient, generateKey, uploadImageFromUrl } from './helpers'

export async function seedHome(dryRun: boolean): Promise<void> {
    const client = createWriteClient()
    const mock = homeMockData

    console.log('\n🏠 Seeding homePage singleton...\n')

    // ── Hero slide images & posters ──────────────────────────────────────────
    console.log('▸ Uploading hero slide media assets...')
    const slideMediaRefs = await Promise.all(
        mock.hero.slides.map(async (slide, i) => {
            let imageRef = null
            let posterRef = null

            if (slide.image?.asset?.url) {
                imageRef = await uploadImageFromUrl(
                    client,
                    slide.image.asset.url,
                    `hero-slide-${i + 1}.jpg`,
                    dryRun,
                )
            }

            if (slide.videoPoster?.asset?.url) {
                posterRef = await uploadImageFromUrl(
                    client,
                    slide.videoPoster.asset.url,
                    `hero-slide-${i + 1}-poster.jpg`,
                    dryRun,
                )
            }

            return { imageRef, posterRef }
        }),
    )

    // ── Teaser video thumbnails ──────────────────────────────────────────────
    console.log('\n▸ Uploading teaser video thumbnails...')
    const teaserVideoRefs = await Promise.all(
        mock.teaserVideos.map(async (tv, i) => {
            const ref = await uploadImageFromUrl(
                client,
                tv.thumbnail.asset.url!,
                `teaser-thumb-${i + 1}.jpg`,
                dryRun,
            )
            return ref
        }),
    )

    // ── Upcoming event cover images ──────────────────────────────────────────
    console.log('\n▸ Uploading upcoming event cover images...')
    const eventCoverRefs = await Promise.all(
        mock.upcomingEvents.map(async (evt, i) => {
            const ref = await uploadImageFromUrl(
                client,
                evt.coverImage.asset.url!,
                `event-cover-${i + 1}.jpg`,
                dryRun,
            )
            return ref
        }),
    )

    // ── Partner logo images ──────────────────────────────────────────────────
    console.log('\n▸ Uploading partner logos...')
    const partnerLogoRefs = await Promise.all(
        mock.partners.map(async (partner, i) => {
            const ref = await uploadImageFromUrl(
                client,
                partner.logo.asset.url!,
                `partner-logo-${i + 1}.png`,
                dryRun,
            )
            return ref
        }),
    )

    // ── Build Sanity document ────────────────────────────────────────────────
    const document = {
        _id: 'homePage',
        _type: 'homePage',

        hero: {
            _type: 'heroSection',
            autoPlayInterval: mock.hero.autoPlayInterval || 3,
            slides: mock.hero.slides.map((slide, i) => {
                const { imageRef, posterRef } = slideMediaRefs[i] || {}
                const vid = slide.video

                return {
                    _key: slide._key || generateKey(`slide-${slide.heading}`),
                    _type: 'heroSlide',
                    heading: slide.heading,
                    description: slide.description,
                    ctaText: slide.ctaText || 'Explore Service',
                    ctaLink: slide.ctaLink,
                    mediaType: slide.mediaType,
                    ...(imageRef && {
                        image: {
                            _type: 'sanityImageWithPriority',
                            asset: imageRef,
                            alt: slide.image?.alt || slide.heading,
                            priority: slide.image?.priority || 100,
                        },
                    }),
                    ...(vid && {
                        video: {
                            _type: 'videoSource',
                            sourceType: vid._type,
                            ...(vid._type === 'external'
                                ? { url: vid.url, provider: vid.provider }
                                : { mimeType: (vid as { mimeType?: string }).mimeType }),
                        },
                    }),
                    ...(posterRef && {
                        videoPoster: {
                            _type: 'sanityImageWithPriority',
                            asset: posterRef,
                            alt: slide.videoPoster?.alt || slide.heading,
                            priority: slide.videoPoster?.priority || 80,
                        },
                    }),
                }
            }),
        },

        // ── Teaser videos header & items ────────────────────────────────────
        teaserVideosEyebrow: mock.teaserVideosEyebrow || 'Visual Stories',
        teaserVideosTitle: mock.teaserVideosTitle || 'Featured Teaser Highlights',
        teaserVideosDescription:
            mock.teaserVideosDescription ||
            'Experience the emotional intensity and cinematic splendor of our handcrafted celebrations.',
        teaserVideos: mock.teaserVideos.map((tv, i) => {
            const vid = tv.video
            return {
                _key: generateKey(`teaser-${tv.title}`),
                _type: 'teaserVideo',
                title: tv.title,
                description: tv.description,
                priority: tv.priority,
                video: {
                    _type: 'videoSource',
                    sourceType: vid._type,
                    ...(vid._type === 'external'
                        ? { url: vid.url, provider: vid.provider }
                        : { mimeType: (vid as { mimeType?: string }).mimeType }),
                },
                ...(teaserVideoRefs[i] && {
                    thumbnail: {
                        _type: 'sanityImageWithPriority',
                        asset: teaserVideoRefs[i],
                        alt: tv.thumbnail.alt,
                        priority: tv.thumbnail.priority,
                    },
                }),
            }
        }),

        // ── Upcoming events ────────────────────────────────────────────────
        upcomingEvents: mock.upcomingEvents.map((evt, i) => ({
            _key: generateKey(`event-${evt.slug.current}`),
            _type: 'upcomingEvent',
            title: evt.title,
            slug: { _type: 'slug', current: evt.slug.current },
            date: evt.date,
            location: evt.location,
            status: evt.status ?? 'upcoming',
            priority: evt.priority,
            ...(eventCoverRefs[i] && {
                coverImage: {
                    _type: 'image',
                    asset: eventCoverRefs[i],
                    alt: evt.coverImage.alt,
                },
            }),
        })),

        // ── Partners ───────────────────────────────────────────────────────
        partners: mock.partners.map((partner, i) => ({
            _key: generateKey(`partner-${partner.name}`),
            _type: 'partner',
            name: partner.name,
            url: partner.url,
            priority: partner.priority,
            ...(partnerLogoRefs[i] && {
                logo: {
                    _type: 'image',
                    asset: partnerLogoRefs[i],
                    alt: partner.logo.alt,
                },
            }),
        })),

        // ── Social links ───────────────────────────────────────────────────
        socialLinks: mock.socialLinks.map((sl) => ({
            _key: generateKey(`social-${sl.platform}`),
            _type: 'socialLink',
            platform: sl.platform,
            url: sl.url,
        })),
    }

    if (dryRun) {
        console.log('\n[dry-run] Would upsert homePage document:')
        console.log(JSON.stringify(document, null, 2))
        return
    }

    // Delete any stale draft document so Sanity Studio displays the seeded published document immediately
    await client.delete('drafts.homePage').catch(() => {
        /* ignore if draft does not exist */
    })

    await client.createOrReplace(document)
    console.log('\n✅ homePage singleton upserted successfully (id: homePage)')
}
