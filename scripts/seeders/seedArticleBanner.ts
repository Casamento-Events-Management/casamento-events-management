/**
 * scripts/seeders/seedArticleBanner.ts
 *
 * Seeds an initial `articleVlogBanner` document into Sanity CMS.
 */

import { articleBannerMockData } from '../../src/data/articleBannerMock';
import { createWriteClient, uploadImageFromUrl } from './helpers';

export async function seedArticleBanner(dryRun: boolean): Promise<void> {
  const client = createWriteClient();
  const mock = articleBannerMockData;

  console.log('\n📰 Seeding articleVlogBanner document...\n');

  let bgImageRef = null;
  if (mock.backgroundImage?.asset?.url) {
    console.log('▸ Uploading article banner background image asset...');
    bgImageRef = await uploadImageFromUrl(
      client,
      mock.backgroundImage.asset.url,
      'article-vlog-banner-bg.jpg',
      dryRun
    );
  }

  const document = {
    _id: 'articleVlogBanner',
    _type: 'articleVlogBanner',
    title: mock.title,
    description: mock.description,
    ...(bgImageRef && {
      backgroundImage: {
        _type: 'image',
        asset: bgImageRef,
        alt: mock.backgroundImage.alt || 'Casamento Events Article Vlog Banner',
      },
    }),
    ...(mock.ctaButton && {
      ctaButton: {
        _type: 'object',
        label: mock.ctaButton.label,
        href: mock.ctaButton.href,
      },
    }),
  };

  if (dryRun) {
    console.log('\n[dry-run] Would upsert articleVlogBanner document:');
    console.log(JSON.stringify(document, null, 2));
    return;
  }

  await client.delete('drafts.articleVlogBanner').catch(() => {});
  await client.createOrReplace(document);
  console.log('✅ articleVlogBanner singleton upserted successfully (id: articleVlogBanner)');
}
