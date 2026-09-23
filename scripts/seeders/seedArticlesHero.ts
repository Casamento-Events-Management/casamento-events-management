/**
 * scripts/seeders/seedArticlesHero.ts
 *
 * Seeds the `articlesHero` singleton document into Sanity CMS.
 */

import { articlesHeroMock } from '../../src/data/articlesHeroMock'
import { createWriteClient } from './helpers'

export async function seedArticlesHero(dryRun: boolean): Promise<void> {
  const client = createWriteClient()
  const mock = articlesHeroMock

  console.log('\n📰 Seeding articlesHero singleton...\n')

  const document = {
    _id: 'articlesHero',
    _type: 'articlesHero',
    eyebrow: mock.eyebrow,
    title: mock.title,
    description: mock.description,
  }

  if (dryRun) {
    console.log('[dry-run] Would upsert articlesHero document:')
    console.log(JSON.stringify(document, null, 2))
    return
  }

  await client.delete('drafts.articlesHero').catch(() => {})
  await client.createOrReplace(document)
  console.log('✅ articlesHero singleton upserted successfully (id: articlesHero)')
}
