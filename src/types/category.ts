// =============================================================================
// category.ts — Shared Media Category Taxonomy Types
//
// Defines the unified category model shared between Portfolio Showcase & Article Vlogs.
// =============================================================================

/**
 * Unified Media Category taxonomy item.
 * Powers category filter tabs in Portfolio Showcase and Article Vlog Gallery.
 */
export interface MediaCategory {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  priority: number;
}

/** Type aliases for domain clarity and backwards compatibility */
export type PortfolioCategory = MediaCategory;
export type ArticleVlogCategory = MediaCategory;
export type ActiveCategoryFilter = 'all' | string;
