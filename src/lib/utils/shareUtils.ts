// =============================================================================
// shareUtils.ts — Reusable Social Media Sharing Utilities
//
// Decoupled helpers for constructing social share URLs, building rich post captions,
// and handling clipboard actions across Facebook, X (Twitter), Instagram, & TikTok.
// =============================================================================

export interface SharePayload {
    /** Main item title */
    title: string;
    /** Direct URL path or absolute canonical link */
    url: string;
    /** Short summary or description text */
    description?: string;
    /** Category identifier for hashtag generation */
    categorySlug?: string;
    /** Venue or geographic location string */
    location?: string;
    /** Client or couple name */
    clientName?: string;
    /** Additional hashtags without '#' prefix */
    hashtags?: string[];
}

/**
 * Returns canonical share URL. Prefers window location if not on localhost.
 */
export function getCanonicalShareUrl(payload: SharePayload): string {
    const rawUrl = payload.url;
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return rawUrl;
        }
    }

    const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `https://casamentoevents.com${cleanPath}`;
}

/**
 * Builds rich, formatted social caption text including title, location, client, and hashtags.
 */
export function getFormattedShareCaption(payload: SharePayload): string {
    const locationInfo = payload.location ? ` 📍 ${payload.location}` : '';
    const clientInfo = payload.clientName ? ` for ${payload.clientName}` : '';
    const descSnippet = payload.description ? `\n\n${payload.description}` : '';
    
    const categoryTag = payload.categorySlug ? ` #${payload.categorySlug.replace(/-/g, '')}` : '';
    const extraTags = payload.hashtags ? ` ${payload.hashtags.map((t) => `#${t}`).join(' ')}` : '';

    return `✨ ${payload.title}${clientInfo}${locationInfo}${descSnippet}\n\n#CasamentoEvents${categoryTag}${extraTags}`;
}

/**
 * Copies the item share URL to the clipboard.
 */
export async function copyShareLinkToClipboard(payload: SharePayload): Promise<boolean> {
    const shareUrl = getCanonicalShareUrl(payload);
    try {
        await navigator.clipboard.writeText(shareUrl);
        return true;
    } catch {
        return false;
    }
}

/**
 * Triggers Facebook Sharer pop-up dialog with pre-filled quote text and hashtag.
 */
export function shareToFacebook(payload: SharePayload): void {
    const shareUrl = getCanonicalShareUrl(payload);
    const quoteText = `✨ ${payload.title} — ${payload.description || 'Masterpieces in Motion by Casamento Events Management.'}`;
    const hashtag = '#CasamentoEvents';
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quoteText)}&hashtag=${encodeURIComponent(hashtag)}`;
    window.open(url, '_blank', 'width=600,height=500,noopener,noreferrer');
}

/**
 * Triggers X (Twitter) Tweet Intent composer with pre-filled text and hashtags.
 */
export function shareToTwitter(payload: SharePayload): void {
    const shareUrl = getCanonicalShareUrl(payload);
    const text = `✨ ${payload.title}${payload.location ? ' in ' + payload.location : ''} by Casamento Events`;
    const categoryTag = payload.categorySlug ? payload.categorySlug.replace(/-/g, '') : 'wedding';
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(`CasamentoEvents,${categoryTag}`)}`;
    window.open(url, '_blank', 'width=600,height=500,noopener,noreferrer');
}

/**
 * Copies rich caption payload to clipboard & opens Instagram.
 */
export async function shareToInstagram(payload: SharePayload): Promise<void> {
    const shareUrl = getCanonicalShareUrl(payload);
    const caption = getFormattedShareCaption(payload);
    try {
        await navigator.clipboard.writeText(`${caption}\n\n${shareUrl}`);
        alert('Full post details & link copied to clipboard! Open Instagram to paste into your Story or Post.');
    } catch {
        // Fallback
    }
    window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
}

/**
 * Copies rich caption payload to clipboard & opens TikTok share.
 */
export async function shareToTikTok(payload: SharePayload): Promise<void> {
    const shareUrl = getCanonicalShareUrl(payload);
    const caption = getFormattedShareCaption(payload);
    try {
        await navigator.clipboard.writeText(`${caption}\n\n${shareUrl}`);
    } catch {
        // Fallback
    }
    window.open(`https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
}
