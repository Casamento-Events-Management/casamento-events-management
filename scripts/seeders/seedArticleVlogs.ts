/**
 * scripts/seeders/seedArticleVlogs.ts
 *
 * Seeds `articleVlog` documents into Sanity CMS from mock data.
 * Uploads thumbnail images and links to existing portfolioCategory documents.
 */

import { articleVlogMockItems } from '../../src/data/articleVlogMock'
import { createWriteClient, uploadImageFromUrl, generateKey } from './helpers'

export async function seedArticleVlogs(dryRun: boolean): Promise<void> {
  const client = createWriteClient()

  console.log(`\n🎬 Seeding ${articleVlogMockItems.length} articleVlog documents...\n`)

  for (const item of articleVlogMockItems) {
    console.log(`▸ Processing: "${item.title}"`)

    // Upload thumbnail
    let thumbnailRef = null
    if (item.thumbnail?.asset?.url) {
      thumbnailRef = await uploadImageFromUrl(
        client,
        item.thumbnail.asset.url,
        `vlog-thumb-${item.slug.current}.jpg`,
        dryRun
      )
    }

    const document = {
      _id: item._id,
      _type: 'articleVlog',
      title: item.title,
      slug: { _type: 'slug', current: item.slug.current },
      // Reference the portfolioCategory document by slug
      category: {
        _type: 'reference',
        _ref: `portfolioCategory-${item.category.slug}`,
      },
      mediaType: item.mediaType,
      ...(thumbnailRef && {
        thumbnail: {
          _type: 'image',
          asset: thumbnailRef,
          alt: item.thumbnail.alt || item.title,
          priority: item.thumbnail.priority ?? 0,
        },
      }),
      ...(item.videoSource && {
        videoSource: {
          _type: 'videoSource',
          sourceType: item.videoSource._type === 'external' ? 'external' : 'sanity',
          url: item.videoSource._type === 'external' ? item.videoSource.url : undefined,
          provider: item.videoSource._type === 'external' ? item.videoSource.provider : undefined,
        },
      }),
      videoDuration: item.videoDuration,
      readTime: item.readTime,
      summary: item.summary,
      description: item.description,
      ...(item.socialBacklinks && {
        socialBacklinks: item.socialBacklinks.map((link) => ({
          _key: generateKey(`${item._id}-${link.platform}`),
          platform: link.platform,
          url: link.url,
        })),
      }),
      publishedAt: item.publishedAt,
      priority: item.priority,
    }

    if (dryRun) {
      console.log('  [dry-run] Would upsert:', JSON.stringify(document, null, 2))
      continue
    }

    await client.delete(`drafts.${item._id}`).catch(() => {})
    await client.createOrReplace(document)
    console.log(`  ✅ Upserted vlog: ${item._id}`)
  }

  console.log('\n✅ All articleVlog documents seeded successfully.')
}
