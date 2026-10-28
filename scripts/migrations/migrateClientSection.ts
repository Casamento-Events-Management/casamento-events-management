import path from 'path';
import { config } from 'dotenv';

// Load .env and .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });

import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET');
  process.exit(1);
}

if (!token) {
  console.error('❌ Missing SANITY_API_WRITE_TOKEN in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

interface SanityDocWithPartners {
  _id: string;
  _type: string;
  partners?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

async function runMigration() {
  const isDryRun =
    process.argv.includes('--dry-run') ||
    process.argv.includes('dry-run') ||
    process.argv.includes('-d');
  console.log(`\n🚀 Starting Client Section Migration (Dry run: ${isDryRun})...\n`);

  // 1. Fetch homeHero (published and draft) and homePage documents
  const candidateDocs: SanityDocWithPartners[] = await client.fetch(`
    *[_id in ["homeHero", "drafts.homeHero", "homePage", "drafts.homePage", "clientSection", "drafts.clientSection"]]
  `);

  console.log(`Found ${candidateDocs.length} related documents:`);
  for (const doc of candidateDocs) {
    console.log(` - ID: ${doc._id} | Type: ${doc._type} | Partners: ${doc.partners?.length ?? 0}`);
  }

  const homeHeroUploadedPartners = [
    {
      _key: '6787c3f80f37',
      _type: 'partner',
      logo: {
        _type: 'image',
        alt: 'd',
        asset: {
          _ref: 'image-b81b80a30e4011fbd2e38875550a41ba080f43e1-1853x930-png',
          _type: 'reference',
        },
      },
      name: 'Test',
      priority: 0,
    },
    {
      _key: '0f8012c73d9c',
      _type: 'partner',
      logo: {
        _type: 'image',
        alt: 'ddddd',
        asset: {
          _ref: 'image-2bc2144fa1c2edff65e7a7dca4cc165718cd3aab-1855x940-png',
          _type: 'reference',
        },
      },
      name: 'test 2 ',
      priority: 0,
    },
  ];

  // If sourceDoc in homeHero had partners, use those.
  const sourceDoc =
    candidateDocs.find((d) => d._id === 'drafts.homeHero' && (d.partners?.length ?? 0) > 0) ||
    candidateDocs.find((d) => d._id === 'homeHero' && (d.partners?.length ?? 0) > 0);

  const finalPartners = sourceDoc?.partners && sourceDoc.partners.length > 0
    ? sourceDoc.partners
    : homeHeroUploadedPartners;

  console.log(`\n📦 Migrating ${finalPartners.length} partners from Home Page Hero to Client Section.`);

  const clientSectionDoc = {
    _id: 'clientSection',
    _type: 'clientSection',
    eyebrow: 'Trusted By',
    title: 'Brands & Organizations We’ve Served',
    description:
      'Proud to have orchestrated milestone celebrations, brand activations, and turnkey corporate productions for distinguished companies and organizations across the Philippines.',
    partners: finalPartners,
  };

  if (isDryRun) {
    console.log('\n[Dry-run] Would create or update "clientSection":', JSON.stringify(clientSectionDoc, null, 2));
  } else {
    // Create or update clientSection
    await client.createOrReplace(clientSectionDoc);
    console.log('✅ "clientSection" document created/updated successfully with the Home Page Hero partner data.');

    // Unset partners on homeHero and drafts.homeHero
    const homeHeroDocsToClean = candidateDocs.filter((d) => d._id === 'homeHero' || d._id === 'drafts.homeHero');
    for (const hDoc of homeHeroDocsToClean) {
      if (hDoc.partners) {
        await client.patch(hDoc._id).unset(['partners']).commit();
        console.log(`🧹 Removed legacy "partners" field from "${hDoc._id}".`);
      }
    }
  }

  console.log('\n✨ Migration finished successfully!\n');
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
