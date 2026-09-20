import type { ServiceCategory, ServiceItem } from '@/types';

/**
 * Mock Service Categories for Phase 1 Scaffolding & Fallback State.
 */
export const MOCK_SERVICE_CATEGORIES: ServiceCategory[] = [
    {
        id: 'cat-1',
        title: 'Full Planning & Styling',
        slug: 'full-planning',
        description: 'End-to-end luxury wedding and corporate gala conceptualization, budgeting, and execution.',
        icon: 'Sparkles',
        priority: 30,
    },
    {
        id: 'cat-2',
        title: 'Coordination & Management',
        slug: 'coordination',
        description: 'Same-day and turn-key event management for smooth, stress-free execution.',
        icon: 'CalendarCheck',
        priority: 20,
    },
    {
        id: 'cat-3',
        title: 'Technical Production & Stream',
        slug: 'production',
        description: 'Broadcast-grade live streaming, intelligent LED stage lighting, and acoustic audio systems.',
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
            title: 'Full Planning & Styling',
            slug: 'full-planning',
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
        startingPrice: 150000,
        priceFormatted: '₱150,000',
        priceUnit: 'starting rate',
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
                price: 45000,
                priceFormatted: '+ ₱45,000',
                priceUnit: 'add-on',
            },
            {
                id: 'addon-2',
                title: 'Live Streaming Broadcast (3-Camera Setup)',
                description: 'Full HD multi-camera live stream for international virtual guests.',
                price: 25000,
                priceFormatted: '+ ₱25,000',
                priceUnit: 'add-on',
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
            title: 'Coordination & Management',
            slug: 'coordination',
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
        startingPrice: 65000,
        priceFormatted: '₱65,000',
        priceUnit: 'starting rate',
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
                price: 10000,
                priceFormatted: '+ ₱10,000',
                priceUnit: 'add-on',
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
            title: 'Technical Production & Stream',
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
        startingPrice: 45000,
        priceFormatted: '₱45,000',
        priceUnit: 'starting rate',
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
                price: 35000,
                priceFormatted: '+ ₱35,000',
                priceUnit: 'add-on',
            },
        ],
        badge: 'Tech Essential',
        isFeatured: false,
        bookingSlug: 'broadcast-live-streaming-production',
        priority: 30,
        createdAt: '2026-02-01T00:00:00Z',
    },
];
