import type { HomePageContent } from '@/types';

// Helper function to mock dates relative to today
const getRelativeDate = (daysOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString();
};

export const homeMockData: HomePageContent = {
    _id: 'drafts.homePage-mock-1',
    _type: 'homePage',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-02T00:00:00Z',
    _rev: 'rev-1',
    hero: {
        brandline: 'Crafting unforgettable celebrations that last a lifetime.',
        showreelVideo: {
            _type: 'external',
            url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', // Wedding cinematic showreel (dev simulation)
            provider: 'youtube'
        },



        showreelThumbnail: {
            _type: 'image',
            asset: {
                _ref: 'image-mockHeroPoster1-1920x1080-jpg',
                _type: 'reference',
                url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1920&auto=format&fit=crop'
            },
            alt: 'Casamento Events Showreel Thumbnail',
            priority: 100,
            caption: 'A compilation of our best moments'
        },
        backgroundMusic: {
            _type: 'file',
            asset: {
                _ref: 'file-mockHeroAudio1-mp3',
                _type: 'reference',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
            }
        },
        ctaButtons: [
            {
                label: 'Book Your Event',
                href: '/contact',
                variant: 'primary'
            },
            {
                label: 'Our Services',
                href: '/services',
                variant: 'secondary'
            }
        ]
    },
    teaserVideos: [
        {
            title: 'Elegant Wedding in the Countryside',
            priority: 30,
            video: {
                _type: 'sanity',
                asset: {
                    _ref: 'file-mockTeaser1-mp4',
                    _type: 'reference',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
                },
                mimeType: 'video/mp4'
            },
            thumbnail: {
                _type: 'image',
                asset: {
                    _ref: 'image-mockTeaserThumb1-800x600-jpg',
                    _type: 'reference',
                    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop'
                },
                alt: 'Wedding in the countryside thumbnail',
                priority: 10
            },
            description: 'A beautiful outdoor ceremony with rustic charm.'
        },
        {
            title: 'Grand Debutante Ball',
            priority: 20,
            video: {
                _type: 'external',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                provider: 'youtube'
            },
            thumbnail: {
                _type: 'image',
                asset: {
                    _ref: 'image-mockTeaserThumb2-800x600-jpg',
                    _type: 'reference',
                    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop'
                },
                alt: 'Grand debutante ball thumbnail',
                priority: 10
            },
            description: 'An enchanting evening of dance and celebration.'
        },
        {
            title: 'Corporate Gala Dinner',
            priority: 10,
            video: {
                _type: 'external',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                provider: 'youtube'
            },
            thumbnail: {
                _type: 'image',
                asset: {
                    _ref: 'image-mockTeaserThumb3-800x600-jpg',
                    _type: 'reference',
                    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop'
                },
                alt: 'Corporate gala dinner thumbnail',
                priority: 10
            }
        }
    ],
    upcomingEvents: [
        {
            title: 'The Smith & Johnson Wedding',
            slug: { _type: 'slug', current: 'smith-johnson-wedding' },
            date: getRelativeDate(14),
            location: 'The Grand Chateau, Manila',
            priority: 100,
            status: 'upcoming',
            coverImage: {
                _type: 'image',
                asset: {
                    _ref: 'image-mockEvent1-800x600-jpg',
                    _type: 'reference',
                    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop'
                },
                alt: 'The Grand Chateau venue'
            }
        },
        {
            title: 'Tech Innovators Summit 2024',
            slug: { _type: 'slug', current: 'tech-innovators-summit-2024' },
            date: getRelativeDate(30),
            location: 'Convention Center, Cebu',
            priority: 50,
            status: 'upcoming',
            coverImage: {
                _type: 'image',
                asset: {
                    _ref: 'image-mockEvent2-800x600-jpg',
                    _type: 'reference',
                    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop'
                },
                alt: 'Tech Summit promotional image'
            }
        },
        {
            title: 'Isabella\'s 18th Birthday',
            slug: { _type: 'slug', current: 'isabellas-18th' },
            date: getRelativeDate(-7),
            location: 'Luxury Hotel, Makati',
            priority: 10,
            status: 'completed',
            coverImage: {
                _type: 'image',
                asset: {
                    _ref: 'image-mockEvent3-800x600-jpg',
                    _type: 'reference',
                    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop'
                },
                alt: 'Isabella\'s 18th Birthday Celebration'
            }
        }
    ],
    partners: [
        {
            name: 'Elite Catering Co.',
            priority: 100,
            url: 'https://example.com/elite-catering',
            logo: {
                _type: 'image',
                asset: {
                    _ref: 'image-mockPartner1-400x200-png',
                    _type: 'reference',
                    url: 'https://picsum.photos/seed/catering/400/200'
                },
                alt: 'Elite Catering Co. logo'
            }
        },
        {
            name: 'Floral Dreams',
            priority: 80,
            url: 'https://example.com/floral-dreams',
            logo: {
                _type: 'image',
                asset: {
                    _ref: 'image-mockPartner2-400x200-png',
                    _type: 'reference',
                    url: 'https://picsum.photos/seed/floral/400/200'
                },
                alt: 'Floral Dreams logo'
            }
        },
        {
            name: 'Luxe Visuals Photography',
            priority: 50,
            logo: {
                _type: 'image',
                asset: {
                    _ref: 'image-mockPartner3-400x200-png',
                    _type: 'reference',
                    url: 'https://picsum.photos/seed/photography/400/200'
                },
                alt: 'Luxe Visuals Photography logo'
            }
        }
    ],
    socialLinks: [
        {
            platform: 'instagram',
            url: 'https://instagram.com/casamentoevents'
        },
        {
            platform: 'facebook',
            url: 'https://facebook.com/casamentoevents'
        },
        {
            platform: 'tiktok',
            url: 'https://tiktok.com/@casamentoevents'
        },
        {
            platform: 'youtube',
            url: 'https://www.youtube.com/@casamentoevents'
        }
    ]
};
