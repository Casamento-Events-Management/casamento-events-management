import type { ServiceCategory, ServiceItem, ServicesHeroContent } from '@/types';

export const MOCK_SERVICES_HERO: ServicesHeroContent = {
    title: 'Full-Service Events Management & Production',
    description:
        'From corporate conferences and brand activations to social celebrations, stage styling, livestreaming, and e-commerce production, we deliver turnkey events tailored to your goals.',
    servicesEyebrow: 'OUR SERVICE CATALOG',
    servicesTitle: 'Explore Our Service Offerings',
    servicesDescription:
        'Select a category below to explore package inclusions, optional add-ons, and custom proposal options.',
};

/**
 * Mock Service Categories for Fallback State.
 */
export const MOCK_SERVICE_CATEGORIES: ServiceCategory[] = [
    {
        id: 'cat-1',
        title: 'Corporate Events',
        slug: 'corporate-events',
        description: 'Conferences, conventions, year-end parties, kickoffs, awards nights, and executive productions.',
        icon: 'Briefcase',
        priority: 40,
    },
    {
        id: 'cat-2',
        title: 'Brand Activations & Roadshows',
        slug: 'brand-activations-and-roadshows',
        description: 'Product launches, mall activations, nationwide roadshows, and experiential sampling campaigns.',
        icon: 'Megaphone',
        priority: 30,
    },
    {
        id: 'cat-3',
        title: 'Social Events',
        slug: 'social-events',
        description: 'Full-service planning and on-the-day coordination for weddings, debuts, milestones, and private celebrations.',
        icon: 'Sparkles',
        priority: 20,
    },
    {
        id: 'cat-4',
        title: 'Livestreaming & Technical Production',
        slug: 'production',
        description: 'Broadcast-grade multi-camera livestreaming, hybrid production, LED walls, and stage design.',
        icon: 'Radio',
        priority: 10,
    },
];

/**
 * Mock Service Items for Phase 1 Scaffolding & Fallback State.
 */
export const MOCK_SERVICE_ITEMS: ServiceItem[] = [
    {
        id: 'service-1',
        title: 'Bespoke Full Wedding Planning & Production',
        slug: 'bespoke-full-wedding-planning',
        category: {
            title: 'Social Events',
            slug: 'social-events',
        },
        serviceType: 'Turnkey Event Management',
        shortDescription: 'Complete end-to-end wedding design, master timeline planning, budget allocation, vendor negotiations, and full day-of execution.',
        fullDescription: 'Our flagship full planning service takes you from initial creative vision to magical wedding day execution. Includes unlimited consultations, vendor selection & contract review, spatial design, guest coordination, and a dedicated 8-person management team.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
                alt: 'Luxury Wedding Reception Styling',
            },
            {
                url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
                alt: 'Grand Stage Backdrop Design',
            },
        ],
        defaultInclusions: [
            'Dedicated Lead Planner & 7 Assistant Coordinators',
            'Full Concept Creation, Color Palette & Floral Styling Direction',
            'Vendor Sourcing, Contract Auditing & Payment Tracking',
            'Master Event Schedule & Technical Run-of-Show',
            'Rehearsal Ceremony Management (Day Before)',
            'RSVP & Guest Seating Chart Management',
        ],
        addOns: [
            {
                id: 'addon-1',
                title: 'Same-Day-Edit (SDE) Video Production',
                description: '4K Cinema SDE video played during the reception dinner.',
            },
            {
                id: 'addon-2',
                title: 'Live Streaming Broadcast (3-Camera Setup)',
                description: 'Full HD multi-camera live stream for international virtual guests.',
            },
        ],
        badge: 'Most Popular',
        isFeatured: true,
        bookingSlug: 'bespoke-full-wedding-planning',
        priority: 50,
        createdAt: '2026-01-15T00:00:00Z',
    },
    {
        id: 'service-2',
        title: 'Turnkey On-The-Day Wedding Coordination',
        slug: 'turnkey-on-the-day-coordination',
        category: {
            title: 'Social Events',
            slug: 'social-events',
        },
        serviceType: 'Same-Day Management',
        shortDescription: 'Seamless execution for couples who have planned their suppliers and need expert day-of directing, timeline enforcement, and crowd control.',
        fullDescription: 'Designed for couples who enjoy self-planning but want to be present as guests at their own wedding. We step in 30 days before the wedding to audit contracts, organize final turnover, align suppliers, and direct the entire day.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
                alt: 'Bride & Groom Stage Entrance',
            },
            {
                url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
                alt: 'Table Setting & Decor Alignment',
            },
        ],
        defaultInclusions: [
            '1 Lead Director & 4 On-Site Operations Coordinators',
            '30-Day Pre-Event Turnover & Vendor Alignment Meeting',
            'Detailed Run-of-Show & Call Sheet Creation',
            'Bridal Assistant for Morning Prep & Dress Fluffing',
            'Turnover of Gifts, Envelopes & Event Inventory',
        ],
        addOns: [
            {
                id: 'addon-3',
                title: 'Extended After-Party Management',
                description: '2 extra hours of DJ & bar coordination after program end.',
            },
        ],
        badge: 'Best Value',
        isFeatured: false,
        bookingSlug: 'turnkey-on-the-day-coordination',
        priority: 40,
        createdAt: '2026-01-20T00:00:00Z',
    },
    {
        id: 'service-3',
        title: 'Hybrid Broadcast Live Streaming & LED Production',
        slug: 'broadcast-live-streaming-production',
        category: {
            title: 'Livestreaming & Technical Production',
            slug: 'production',
        },
        serviceType: 'Technical Event Production',
        shortDescription: 'High-definition multi-camera live broadcast, custom LED visual backdrops, and pro audio setup for weddings, galas, and corporate events.',
        fullDescription: 'Connect loved ones worldwide with broadcast-grade 1080p60 live streaming. Includes professional video switchers, wireless audio mics, bonding cellular modems for zero buffer, and custom graphic overlays.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
                alt: 'Live Stream Concert Stage',
            },
            {
                url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
                alt: 'Lighting Control Console',
            },
        ],
        defaultInclusions: [
            '3 Full HD Cinema Cameras with Dedicated Operators',
            'Blackmagic Design Video Switcher & Live Stream Encoder',
            'Bonded Internet Router (Dual-SIM High-Speed Backup)',
            'Custom Lower-Third Graphics & Pre-Show Video Loop',
            'Private Dedicated Website Link & YouTube/Facebook Stream',
            'Raw Video File Delivery on Hard Drive post-event',
        ],
        addOns: [
            {
                id: 'addon-4',
                title: 'P3.9 Indoor LED Wall 10ft x 14ft',
                description: 'High-brightness modular LED screen for stage visual backdrops.',
            },
        ],
        badge: 'Tech Essential',
        isFeatured: false,
        bookingSlug: 'broadcast-live-streaming-production',
        priority: 30,
        createdAt: '2026-02-01T00:00:00Z',
    },
    {
        id: 'service-4',
        title: 'Luxury Destination Wedding Planning & Styling',
        slug: 'luxury-destination-wedding-planning',
        category: {
            title: 'Social Events',
            slug: 'social-events',
        },
        serviceType: 'Bespoke Destination Planning',
        shortDescription: 'Comprehensive planning, travel arrangement, guest hospitality, multi-day itinerary design, and venue styling for island and overseas destination weddings.',
        fullDescription: 'Turn your dream destination wedding into a seamless, luxurious multi-day celebration. From island logistics (Bora, El Nido, Tagaytay, Cebu) to guest transfers, welcome party styling, main ceremony design, and post-wedding brunch coordination.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1200&q=80',
                alt: 'Beachside Destination Wedding Setup',
            },
            {
                url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
                alt: 'Tropical Floral Arch & Scenic Reception',
            },
        ],
        defaultInclusions: [
            'Lead Destination Planner & 6 Travel Logistics Coordinators',
            'Multi-Day Itinerary Planning (Welcome Dinner + Wedding Day + Recovery Brunch)',
            'Hotel Accommodations & Guest Shuttle Transfer Management',
            'Bespoke Spatial Design, Floral Concepts & Ambient Lighting',
            'On-Site Supplier Coordination & Island Permit Handling',
            'Welcome Bag Packaging & Guest Concierge Desk',
        ],
        addOns: [
            {
                id: 'addon-5',
                title: 'Pre-Wedding Island Sunset Welcome Party',
                description: 'Full styling, cocktail bar setup, and live acoustic duo for the night before.',
            },
        ],
        badge: 'Signature Destination',
        isFeatured: true,
        bookingSlug: 'luxury-destination-wedding-planning',
        priority: 45,
        createdAt: '2026-03-01T00:00:00Z',
    },
];
