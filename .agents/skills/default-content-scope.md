# Default Content Scope — Casamento Events Management

## Rule
When writing **default prop values, placeholder copy, or example content** for any UI element (hero text, titles, descriptions, CTAs, form labels, empty states, etc.), never default to wedding/couple-only language unless the component is explicitly wedding-scoped (e.g. `WeddingHero`, `RSVPForm`).

Casamento offers 9 service categories — weddings are ONE of them, not the default identity. A generic component (`BookingHero`, `ServiceCard`, `InquiryForm`, `EventCTA`, etc.) must default to **neutral, category-spanning language**, not wedding-specific nouns like "couple," "bride," "your big day," "wedding," etc.

## Before writing any default value, ask:
1. Is this component tied to ONE specific service? → wedding/corporate/brand-specific wording is fine.
2. Is this component generic/reusable across services? → default copy MUST be service-agnostic. Reference "your event," "your project," or list 2–3 varied categories, never lead with wedding alone.

## Bad vs Good
```
❌ title = 'Reserve Your Date with Casamento'
❌ description = 'Schedule a consultation for your wedding day...'

✅ title = 'Plan Your Event with Casamento'
✅ description = 'Schedule a consultation for weddings, corporate events, brand activations, livestreaming, and more.'
```

## Service Categories (use for variety in generic defaults — rotate/sample, don't always lead with weddings)
- **Social Events** — weddings, debuts, birthdays, anniversaries, christenings, private celebrations
- **Corporate Events** — conferences, conventions, year-end parties, kickoffs, awards, team-building
- **Brand Activations & Roadshows** — product launches, mall events, nationwide roadshows, sampling campaigns
- **Creative Production** — concept development, creative direction, stage/booth design, scriptwriting
- **Event Styling & Production Design** — stage/set design, branded installations, lighting, décor
- **Livestreaming & Digital Events** — multi-camera livestreaming, hybrid production, broadcast graphics
- **E-Commerce Production** — live-selling production, host/talent coordination, viewer engagement
- **Digital Advertising** — campaign concepts, social content, promotional videos, key visuals

## Enforcement
- When unsure of scope, default to broad language ("your event," "your brand," "your project") over any single category.
