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
    return (
        <section className="relative overflow-hidden bg-[#F7F3E8] py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
                {/* Main Heading with font-serif and Padding Top */}
                <h1 className="pt-16 sm:pt-10 md:pt-26 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold tracking-tight text-[#3A4F1C] mb-6 leading-tight">
                    {categoryTitle ? (
                        <>
                            <span className="text-[#BC6F07]">
                                {categoryTitle}
                            </span>{' '}
                            Portfolio
                        </>
                    ) : (
                        title
                    )}
                </h1>

                {/* Subtitle / Description */}
                <p className="text-base sm:text-lg text-[#3A4F1C]/80 max-w-4xl mx-auto leading-relaxed font-light">
                    {description}
                </p>
            </div>
        </section>
    );
}
