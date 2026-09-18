// =============================================================================
// share-dropdown.tsx — Reusable Social Media Share Dropdown Component
//
// Interactive inline dropdown menu component for sharing any content item across
// Copy Link, Facebook, X (Twitter), Instagram, and TikTok.
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
}

export function ShareDropdown({
    payload,
    buttonClassName,
    align = 'right',
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

    const defaultButtonClass = "min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] cursor-pointer";
    const activeClass = isOpen
        ? "bg-[#2A3A14] text-[#F7F3E8]"
        : "text-[#EFEAD8]/80 hover:text-[#F7F3E8] hover:bg-[#2A3A14]";

    const alignClass = align === 'left' ? 'left-0' : 'right-0';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={buttonClassName || `${defaultButtonClass} ${activeClass}`}
                aria-label="Share options"
                aria-expanded={isOpen}
            >
                <Share2 className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className={`absolute ${alignClass} top-full mt-2 z-50 w-60 rounded-xl bg-[#141C0C] border border-[#3A4F1C]/60 shadow-2xl p-2 backdrop-blur-md text-[#F7F3E8] text-xs font-medium space-y-1 animate-in fade-in zoom-in-95 duration-150`}>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2A3A14] text-left transition-colors text-[#EFEAD8] hover:text-[#F7F3E8]"
                    >
                        <span>{isCopied ? 'Link Copied!' : 'Copy Direct Link'}</span>
                        <SocialIcon platform={isCopied ? 'check' : 'copylink'} className="w-4 h-4 text-[#BC6F07]" />
                    </button>

                    <button
                        type="button"
                        onClick={handleFB}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2A3A14] text-left transition-colors text-[#EFEAD8] hover:text-[#F7F3E8]"
                    >
                        <span>Facebook</span>
                        <SocialIcon platform="facebook" className="w-4 h-4 text-[#BC6F07]" />
                    </button>

                    <button
                        type="button"
                        onClick={handleTwitter}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2A3A14] text-left transition-colors text-[#EFEAD8] hover:text-[#F7F3E8]"
                    >
                        <span>X</span>
                        <SocialIcon platform="x" className="w-4 h-4 text-[#BC6F07]" />
                    </button>

                    <button
                        type="button"
                        onClick={handleIG}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2A3A14] text-left transition-colors text-[#EFEAD8] hover:text-[#F7F3E8]"
                    >
                        <span>Instagram</span>
                        <SocialIcon platform="instagram" className="w-4 h-4 text-[#BC6F07]" />
                    </button>

                    <button
                        type="button"
                        onClick={handleTikTok}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2A3A14] text-left transition-colors text-[#EFEAD8] hover:text-[#F7F3E8]"
                    >
                        <span>TikTok</span>
                        <SocialIcon platform="tiktok" className="w-4 h-4 text-[#BC6F07]" />
                    </button>
                </div>
            )}
        </div>
    );
}

