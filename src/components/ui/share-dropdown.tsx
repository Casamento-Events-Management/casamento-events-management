// =============================================================================
// share-dropdown.tsx — Reusable Social Media Share Dropdown Component
//
// Interactive inline icon dropdown menu component for sharing any content item across
// Copy Link, Facebook, X (Twitter), Instagram, and TikTok.
// Supports drop direction ('down' | 'left') and theme modes ('light' | 'dark').
// =============================================================================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import {
    type SharePayload,
    copyShareLinkToClipboard,
    shareToFacebook,
    shareToTwitter,
    shareToInstagram,
    shareToTikTok,
} from '@/lib/utils/shareUtils';
import { SocialIcon } from '@/components/ui/social-icon';

export interface ShareDropdownProps {
    payload: SharePayload;
    buttonClassName?: string;
    align?: 'left' | 'right';
    direction?: 'down' | 'left';
    theme?: 'light' | 'dark';
}

export function ShareDropdown({
    payload,
    buttonClassName,
    align = 'right',
    direction = 'down',
    theme = 'light',
}: ShareDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Outside click detection
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            window.addEventListener('mousedown', handleClickOutside);
        }
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleCopy = async () => {
        const success = await copyShareLinkToClipboard(payload);
        if (success) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }
    };

    const handleFB = () => {
        shareToFacebook(payload);
        setIsOpen(false);
    };

    const handleTwitter = () => {
        shareToTwitter(payload);
        setIsOpen(false);
    };

    const handleIG = async () => {
        await shareToInstagram(payload);
        setIsOpen(false);
    };

    const handleTikTok = async () => {
        await shareToTikTok(payload);
        setIsOpen(false);
    };

    // Theme-based trigger button classes
    const lightTrigger = isOpen
        ? 'bg-[#BC6F07] text-[#F7F3E8] shadow-xs'
        : 'text-[#3A4F1C]/70 hover:text-[#BC6F07] hover:bg-[#3A4F1C]/10';

    const darkTrigger = isOpen
        ? 'bg-[#BC6F07] text-[#F7F3E8] shadow-xs'
        : 'text-[#EFEAD8]/80 hover:text-[#F7F3E8] hover:bg-[#2A3A14]';

    const defaultButtonClass = `p-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] cursor-pointer ${
        theme === 'dark' ? darkTrigger : lightTrigger
    }`;

    // Direction & Alignment positioning classes
    let positionClass = 'absolute z-50';
    if (direction === 'left') {
        positionClass += ' right-full top-1/2 -translate-y-1/2 mr-2';
    } else {
        // direction === 'down'
        positionClass += ` top-full mt-2 ${align === 'left' ? 'left-0' : 'right-0'}`;
    }

    return (
        <div className="relative inline-flex items-center" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={buttonClassName || defaultButtonClass}
                aria-label="Share options"
                aria-expanded={isOpen}
                title="Share"
            >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {isOpen && (
                <div className={`${positionClass} flex items-center gap-1.5 p-1.5 rounded-full bg-[#1A2310] border border-[#BC6F07]/40 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150`}>
                    {/* Copy Link */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        title={isCopied ? 'Link Copied!' : 'Copy Direct Link'}
                        aria-label={isCopied ? 'Link Copied' : 'Copy Direct Link'}
                        className="p-2 rounded-full text-[#F7F3E8]/80 hover:text-white hover:bg-[#BC6F07] transition-all duration-200 transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                        <SocialIcon platform={isCopied ? 'check' : 'copylink'} className="w-4 h-4 text-[#BC6F07]" />
                    </button>

                    {/* Facebook */}
                    <button
                        type="button"
                        onClick={handleFB}
                        title="Share on Facebook"
                        aria-label="Share on Facebook"
                        className="p-2 rounded-full text-[#F7F3E8]/80 hover:text-white hover:bg-[#BC6F07] transition-all duration-200 transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                        <SocialIcon platform="facebook" className="w-4 h-4" />
                    </button>

                    {/* X (Twitter) */}
                    <button
                        type="button"
                        onClick={handleTwitter}
                        title="Share on X"
                        aria-label="Share on X"
                        className="p-2 rounded-full text-[#F7F3E8]/80 hover:text-white hover:bg-[#BC6F07] transition-all duration-200 transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                        <SocialIcon platform="x" className="w-4 h-4" />
                    </button>

                    {/* Instagram */}
                    <button
                        type="button"
                        onClick={handleIG}
                        title="Share on Instagram"
                        aria-label="Share on Instagram"
                        className="p-2 rounded-full text-[#F7F3E8]/80 hover:text-white hover:bg-[#BC6F07] transition-all duration-200 transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                        <SocialIcon platform="instagram" className="w-4 h-4" />
                    </button>

                    {/* TikTok */}
                    <button
                        type="button"
                        onClick={handleTikTok}
                        title="Share on TikTok"
                        aria-label="Share on TikTok"
                        className="p-2 rounded-full text-[#F7F3E8]/80 hover:text-white hover:bg-[#BC6F07] transition-all duration-200 transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                        <SocialIcon platform="tiktok" className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
