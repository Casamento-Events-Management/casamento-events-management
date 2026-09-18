// =============================================================================
// portfolioMock.ts — Mock Portfolio Data
//
// Fallback dataset for Portfolio items and categories. Mirrors the GROQ shape
// returned from Sanity CMS for local development and static fallback.
// =============================================================================

import type { PortfolioCategory, PortfolioItem } from '@/types';

export const MOCK_PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
    {
        id: 'cat-weddings',
        title: 'Wedding Events',
        slug: 'weddings',
        description: 'Cinematic wedding films, same-day edits, and unforgettable celebration highlights capturing pure emotion and elegance.',
        priority: 100,
    },
    {
        id: 'cat-production',
        title: 'Production Designs',
        slug: 'production-design',
        description: 'Bespoke stage production, immersive lighting design, backdrop architecture, and visual aesthetics for grand events.',
        priority: 90,
    },
    {
        id: 'cat-streaming',
        title: 'Streaming & Broadcast',
        slug: 'streaming',
        description: 'High-definition multi-camera live streaming, hybrid event broadcasting, and real-time remote audience engagement.',
        priority: 80,
    },
];

export const MOCK_PORTFOLIO_ITEMS: PortfolioItem[] = [
    {
        id: 'port-1',
        title: 'Julian & Sophia\'s Destination Wedding',
        slug: 'julian-sophia-wedding',
        category: {
            title: 'Wedding Events',
            slug: 'weddings',
        },
        tags: ['Destination Wedding', 'Same Day Edit', '4K Cinema', 'Boracay'],
        thumbnail: {
            url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
            alt: 'Julian and Sophia destination wedding sunset film poster',
            caption: 'Filmed on location at Shangri-La Boracay Resort',
        },
        video: {
            _type: 'external',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            provider: 'youtube',
        },
        description: 'A breathtaking sunset wedding film captured along the pristine white beach of Boracay Island. Featuring dual-operator drone footage, crystal-clear audio vows, and a lively evening reception production.',
        eventDate: '2025-11-18',
        location: 'Boracay, Aklan',
        clientName: 'Julian & Sophia Tan',
        featured: true,
        priority: 100,
    },
    {
        id: 'port-2',
        title: 'Apex Tech Global Gala Stage & Light Show',
        slug: 'apex-tech-gala-production',
        category: {
            title: 'Production Designs',
            slug: 'production-design',
        },
        tags: ['Stage Design', 'LED Mapping', 'Lighting Production', 'Corporate'],
        thumbnail: {
            url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
            alt: 'Apex Tech Global Gala futuristic stage light setup',
            caption: 'Custom 360-degree curved LED wall & moving head light rig',
        },
        video: {
            _type: 'external',
            url: 'https://player.vimeo.com/video/76979871',
            provider: 'vimeo',
        },
        description: 'Custom-built 3D stage layout with dynamic kinetic LED ceiling panels and programmable light choreography for over 1,200 executive delegates at the Grand Ballroom.',
        eventDate: '2025-09-24',
        location: 'SMX Convention Center, Manila',
        clientName: 'Apex Innovations Corp.',
        featured: true,
        priority: 95,
    },
    {
        id: 'port-3',
        title: 'Global Healthcare Summit 2025 Hybrid Stream',
        slug: 'global-healthcare-summit-live',
        category: {
            title: 'Streaming & Broadcast',
            slug: 'streaming',
        },
        tags: ['Multi-Cam Broadcast', 'Hybrid Event', 'Low-Latency Stream', '1080p60'],
        thumbnail: {
            url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
            alt: 'Global Healthcare Summit livestream control room operator',
            caption: 'Broadcast-grade multi-cam video switching & live graphics overlay',
        },
        video: {
            _type: 'external',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            provider: 'youtube',
        },
        description: '3-day international medical symposium streamed live to 15,000 online attendees across 28 countries with real-time Q&A integration and multi-language translation audio tracks.',
        eventDate: '2025-08-10',
        location: 'Seda Hotel & Virtual Portal',
        clientName: 'Philippine Medical Alliance',
        featured: true,
        priority: 90,
    },
    {
        id: 'port-4',
        title: 'Marc & Elena\'s Cathedral Nuptials & Grand Ball',
        slug: 'marc-elena-cathedral-wedding',
        category: {
            title: 'Wedding Events',
            slug: 'weddings',
        },
        tags: ['Church Wedding', 'Grand Reception', 'Cinematic Highlight', 'Manila'],
        thumbnail: {
            url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop',
            alt: 'Marc and Elena cathedral wedding ceremony highlight poster',
            caption: 'San Agustin Church Manila & Marriott Grand Ballroom',
        },
        video: {
            _type: 'external',
            url: 'https://player.vimeo.com/video/76979871',
            provider: 'vimeo',
        },
        description: 'An elegant heritage church ceremony followed by a lavish floral-filled ballroom celebration. Highlights include emotional vow exchanges and live orchestra performances.',
        eventDate: '2025-06-15',
        location: 'Manila Cathedral & Okada Manila',
        clientName: 'Marc & Elena Santos',
        featured: false,
        priority: 85,
    },
    {
        id: 'port-5',
        title: 'Vogue Horizon Fashion Week Runway Set',
        slug: 'vogue-horizon-fashion-week',
        category: {
            title: 'Production Designs',
            slug: 'production-design',
        },
        tags: ['Runway Setup', 'Architectural Lighting', 'Sound Engineering'],
        thumbnail: {
            url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200&auto=format&fit=crop',
            alt: 'Vogue Horizon runway production setup',
            caption: 'Minimalist glass runway with ambient laser projections',
        },
        video: {
            _type: 'sanity',
            asset: {
                _ref: 'file-mockShowreel-mp4',
                _type: 'reference',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            },
            mimeType: 'video/mp4',
        },
        description: 'Avant-garde runway production featuring custom acrylic reflective floors, synchronized strobe lighting arrays, and acoustic sound reinforcement.',
        eventDate: '2025-04-02',
        location: 'BGC Arts Center, Taguig',
        clientName: 'Vogue Horizon Philippines',
        featured: false,
        priority: 80,
    },
    {
        id: 'port-6',
        title: 'National Esports Championship Final Broadcast',
        slug: 'national-esports-championship-broadcast',
        category: {
            title: 'Streaming & Broadcast',
            slug: 'streaming',
        },
        tags: ['Esports Live', 'Low-Latency Streaming', 'Virtual Studio', 'Twitch & YT'],
        thumbnail: {
            url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
            alt: 'Esports championship live broadcast arena stage',
            caption: 'Ultra-low latency stream to 100k peak concurrent viewers',
        },
        video: {
            _type: 'external',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            provider: 'youtube',
        },
        description: 'Full-scale esports tournament production with instant instant-replay systems, caster desk commentary feeds, player webcam PiP inserts, and simultaneous dual-platform restreaming.',
        eventDate: '2025-02-20',
        location: 'Mall of Asia Arena, Pasay',
        clientName: 'CyberSports League Asia',
        featured: false,
        priority: 75,
    },
];
