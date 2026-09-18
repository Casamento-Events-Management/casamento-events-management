import { homeMockData } from '@/data/homeMock';
import type { HomePageContent } from '@/types';

/**
 * Service module for retrieving Home Page content.
 * 
 * Per Phase 1 UI Scaffolding rules:
 * Components and page routes MUST NOT import `src/data/**` directly.
 * All content access is routed through this decoupled service layer.
 */
export async function getHomePageContent(): Promise<HomePageContent> {
  // Deep clone to prevent accidental mutations on mock data
  const data: HomePageContent = JSON.parse(JSON.stringify(homeMockData));

  // Ensure items are sorted by priority (descending) as GROQ queries will in production
  data.teaserVideos.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  data.upcomingEvents.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  data.partners.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  return data;
}
