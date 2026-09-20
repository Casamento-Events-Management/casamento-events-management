import React from 'react';
import type { ServiceItem } from '@/types';

interface ServicesJsonLdProps {
    services: ServiceItem[];
}

/**
 * ServicesJsonLd Component
 *
 * Injects structured schema.org JSON-LD data for Services & Offers to maximize SEO performance.
 */
export function ServicesJsonLd({ services }: ServicesJsonLdProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';

    const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: services.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Service',
                '@id': `${siteUrl}/services?service=${service.slug}`,
                name: service.title,
                description: service.shortDescription,
                provider: {
                    '@type': 'LocalBusiness',
                    name: 'Casamento Events Management',
                    url: siteUrl,
                },
                offers: {
                    '@type': 'Offer',
                    priceCurrency: 'PHP',
                    price: service.startingPrice,
                    priceSpecification: {
                        '@type': 'UnitPriceSpecification',
                        priceCurrency: 'PHP',
                        price: service.startingPrice,
                        unitText: service.priceUnit || 'starting rate',
                    },
                },
                image: service.images && service.images[0] ? service.images[0].url : undefined,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}
