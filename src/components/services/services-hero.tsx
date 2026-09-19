import React from 'react';

interface ServicesHeroProps {
    title?: string;
    description?: string;
    categoryTitle?: string;
}

/**
 * ServicesHero Component
 *
 * Renders the primary editorial hero banner for the Services page.
 * Uses exact page margin, typography hierarchy, and warm cream/olive palette as PortfolioHero.
 */
export function ServicesHero({
    title = 'Crafted Experiences, Unforgettable Moments',
    description = 'Discover our bespoke wedding planning, turnkey coordination, and broadcast-grade technical production services tailored for luxury celebrations across the Philippines.',
    categoryTitle,
}: ServicesHeroProps) {
    return (
        <section className="relative overflow-hidden bg-[#F7F3E8] py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold tracking-tight text-[#3A4F1C] mb-6 leading-tight">
                    {categoryTitle ? `${categoryTitle} Services` : title}
                </h1>

                {/* Subtitle / Description */}
                <p className="text-base sm:text-lg text-[#3A4F1C]/80 max-w-4xl mx-auto leading-relaxed font-light">
                    {description}
                </p>
                <div className="w-12 h-0.5 bg-[#BC6F07]/60 mx-auto mt-8" />
            </div>
        </section>
    );
}
