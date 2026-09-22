import React from 'react';

interface PortfolioHeroProps {
    title?: string;
    description?: string;
    categoryTitle?: string;
}

export function PortfolioHero({
    title = 'Masterpieces in Motion',
    description = 'Explore our curated showcase of high-end wedding films, immersive stage productions, and broadcast-grade live streams crafted with technical precision and artistic passion.',
    categoryTitle,
}: PortfolioHeroProps) {
    const displayTitle = categoryTitle ? `${categoryTitle} Portfolio` : title;

    return (
        <section className="relative overflow-hidden bg-[#F7F3E8] pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {displayTitle && (
                    <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-[#3A4F1C] mb-4 sm:mb-6 leading-tight [text-wrap:balance]">
                        {displayTitle}
                    </h1>
                )}

                {/* Subtitle / Description */}
                {description && (
                    <p className="text-sm sm:text-base md:text-lg text-[#3A4F1C]/80 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed font-light [text-wrap:balance]">
                        {description}
                    </p>
                )}
                <div className="w-12 h-0.5 bg-[#BC6F07]/60 mx-auto mt-6 sm:mt-8" />
            </div>
        </section>
    );
}
