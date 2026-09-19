/**
 * scripts/seed-sanity.ts
 *
 * CLI entry point for the Sanity seed automation script.
 *
 * Usage:
 *   npx tsx scripts/seed-sanity.ts src/data/homeMock
 *   npx tsx scripts/seed-sanity.ts src/data/portfolioMock
 *   npx tsx scripts/seed-sanity.ts src/data/homeMock --dry-run
 *
 * Or via npm script alias:
 *   npm run seed src/data/homeMock
 *   npm run seed src/data/portfolioMock -- --dry-run
 *
 * Flags:
 *   --dry-run   Preview documents that would be uploaded; no writes to Sanity.
 */

import path from 'path'
import { config } from 'dotenv'

// Load .env and .env.local (Next.js convention)
config({ path: path.resolve(process.cwd(), '.env.local') })
config({ path: path.resolve(process.cwd(), '.env') })

// ---------------------------------------------------------------------------
// Argument Parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const fileArg = args.find((a) => !a.startsWith('--'))

if (!fileArg) {
    console.error('❌ Error: Please specify a data file to seed.')
    console.error('   Usage: npx tsx scripts/seed-sanity.ts src/data/homeMock')
    console.error('          npx tsx scripts/seed-sanity.ts src/data/portfolioMock')
    process.exit(1)
}

// Normalize file name — support both "src/data/homeMock" and "homeMock"
const fileName = path.basename(fileArg).replace(/\.ts$/, '')

// ---------------------------------------------------------------------------
// Seeder Registry
// ---------------------------------------------------------------------------

const SEEDERS: Record<string, () => Promise<void>> = {
    homeMock: async () => {
        const { seedHome } = await import('./seeders/seedHome')
        await seedHome(dryRun)
    },
    portfolioMock: async () => {
        const { seedPortfolio } = await import('./seeders/seedPortfolio')
        await seedPortfolio(dryRun)
    },
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
    const seeder = SEEDERS[fileName]

    if (!seeder) {
        console.error(`❌ No seeder found for file: "${fileName}"`)
        console.error('   Available seeders:')
        Object.keys(SEEDERS).forEach((k) => console.error(`     - src/data/${k}`))
        process.exit(1)
    }

    if (dryRun) {
        console.log('🔍 DRY RUN MODE — no data will be written to Sanity.\n')
    }

    console.log(`🌱 Running seeder for: ${fileName}`)
    console.log(`   Dataset : ${process.env.NEXT_PUBLIC_SANITY_DATASET}`)
    console.log(`   Project : ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}\n`)

    try {
        await seeder()
        console.log('\n🎉 Seed complete.')
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`\n❌ Seed failed: ${message}`)
        if (err instanceof Error && err.stack) {
            console.error(err.stack)
        }
        process.exit(1)
    }
}

main()
