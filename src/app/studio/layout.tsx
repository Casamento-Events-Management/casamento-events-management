/**
 * Studio Layout — Overrides the root layout for all /studio/* routes.
 *
 * Intentionally renders NO Header, Footer, or site chrome.
 * Sanity Studio renders its own full-screen UI and must not have
 * any site-level elements wrapping it.
 */
export { metadata, viewport } from 'next-sanity/studio'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
