/**
 * scripts/seeders/seedAboutUsPage.ts
 *
 * Standalone, isolated Sanity CMS migration / seed script for the About Us page.
 * Upserts ONLY the 6 About Us singleton documents — no other seed scripts run:
 *   1. `aboutHero`
 *   2. `aboutStory`
 *   3. `aboutMissionVision`
 *   4. `aboutCoreValues`
 *   5. `aboutWhyChoose`
 *   6. `aboutCta`
 *
 * Usage:
 *   npx tsx scripts/seeders/seedAboutUsPage.ts
 *   npx tsx scripts/seeders/seedAboutUsPage.ts --dry-run
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import {
  ABOUT_CORE_VALUES_MOCK,
  ABOUT_CTA_MOCK,
  ABOUT_HERO_MOCK,
  ABOUT_MISSION_VISION_MOCK,
  ABOUT_STORY_MOCK,
  ABOUT_WHY_CHOOSE_MOCK,
} from '../../src/data/aboutMock'
import { createWriteClient, generateKey } from './helpers'

// Load environment variables (.env.local takes precedence, matching Next.js)
config({ path: path.resolve(process.cwd(), '.env.local') })
config({ path: path.resolve(process.cwd(), '.env') })

export async function seedAboutUsPage(dryRun = false): Promise<void> {
  const client = createWriteClient()

  console.log('\n📖 Seeding About Us Page singleton documents...\n')

  const documents: Array<{ _id: string; _type: string; [key: string]: unknown }> = [
    {
      _id: 'aboutHero',
      _type: 'aboutHero',
      eyebrow: ABOUT_HERO_MOCK.eyebrow,
      title: ABOUT_HERO_MOCK.title,
      description: ABOUT_HERO_MOCK.description,
    },
    {
      _id: 'aboutStory',
      _type: 'aboutStory',
      paragraphs: ABOUT_STORY_MOCK.paragraphs,
      closingStatement: ABOUT_STORY_MOCK.closingStatement,
      mantras: ABOUT_STORY_MOCK.mantras,
    },
    {
      _id: 'aboutMissionVision',
      _type: 'aboutMissionVision',
      eyebrow: ABOUT_MISSION_VISION_MOCK.eyebrow,
      title: ABOUT_MISSION_VISION_MOCK.title,
      description: ABOUT_MISSION_VISION_MOCK.description,
      mission: {
        _type: 'aboutCardItem',
        title: ABOUT_MISSION_VISION_MOCK.mission.title,
        description: ABOUT_MISSION_VISION_MOCK.mission.description,
        icon: ABOUT_MISSION_VISION_MOCK.mission.icon,
      },
      vision: {
        _type: 'aboutCardItem',
        title: ABOUT_MISSION_VISION_MOCK.vision.title,
        description: ABOUT_MISSION_VISION_MOCK.vision.description,
        icon: ABOUT_MISSION_VISION_MOCK.vision.icon,
      },
    },
    {
      _id: 'aboutCoreValues',
      _type: 'aboutCoreValues',
      eyebrow: ABOUT_CORE_VALUES_MOCK.eyebrow,
      title: ABOUT_CORE_VALUES_MOCK.title,
      description: ABOUT_CORE_VALUES_MOCK.description,
      items: ABOUT_CORE_VALUES_MOCK.items.map((item) => ({
        _key: generateKey(`core-value-${item.title}`),
        _type: 'aboutCardItem',
        title: item.title,
        description: item.description,
        icon: item.icon,
      })),
    },
    {
      _id: 'aboutWhyChoose',
      _type: 'aboutWhyChoose',
      eyebrow: ABOUT_WHY_CHOOSE_MOCK.eyebrow,
      title: ABOUT_WHY_CHOOSE_MOCK.title,
      description: ABOUT_WHY_CHOOSE_MOCK.description,
      items: ABOUT_WHY_CHOOSE_MOCK.items.map((item) => ({
        _key: generateKey(`why-choose-${item.title}`),
        _type: 'aboutCardItem',
        title: item.title,
        description: item.description,
        icon: item.icon,
      })),
    },
    {
      _id: 'aboutCta',
      _type: 'aboutCta',
      eyebrow: ABOUT_CTA_MOCK.eyebrow,
      title: ABOUT_CTA_MOCK.title,
      description: ABOUT_CTA_MOCK.description,
      secondaryCtaText: ABOUT_CTA_MOCK.secondaryCtaText,
      secondaryCtaLink: ABOUT_CTA_MOCK.secondaryCtaLink,
      primaryCtaText: ABOUT_CTA_MOCK.primaryCtaText,
      primaryCtaLink: ABOUT_CTA_MOCK.primaryCtaLink,
    },
  ]

  if (dryRun) {
    console.log('[dry-run] Would upsert the following 6 About Us singleton documents:')
    console.log(JSON.stringify(documents, null, 2))
    return
  }

  for (const doc of documents) {
    await client.delete(`drafts.${doc._id}`).catch(() => {})
    await client.createOrReplace(doc)
    console.log(`  ✅ Upserted ${doc._type} singleton (id: ${doc._id})`)
  }

  console.log(`\n🎉 About Us migration complete — ${documents.length} singleton documents synced.`)
}

// ---------------------------------------------------------------------------
// Direct CLI Entrypoint (isolated execution)
// ---------------------------------------------------------------------------

const isDirectExecution = (() => {
  const entry = process.argv[1]
  if (!entry) return false
  return path.resolve(entry).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()
})()

if (isDirectExecution) {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run') || args.includes('-d')

  if (dryRun) {
    console.log('🔍 DRY RUN MODE — no data will be written to Sanity.\n')
  }

  console.log('🌱 Running isolated seeder: seedAboutUsPage')
  console.log(`   Project : ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '(missing)'}`)
  console.log(`   Dataset : ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? '(missing)'}`)

  seedAboutUsPage(dryRun).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`\n❌ About Us seed failed: ${message}`)
    if (err instanceof Error && err.stack) {
      console.error(err.stack)
    }
    process.exit(1)
  })
}
