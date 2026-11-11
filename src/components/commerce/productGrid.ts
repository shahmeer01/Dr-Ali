/**
 * Shared responsive ladder for product card grids (catalogue, related
 * products, homepage teaser) so every listing surface uses the same
 * column breakpoints and gaps:
 *   1 col → 2 cols (≥560px) → 3 cols (lg) → 4 cols (xl).
 * Fixed tracks keep a lone card at its natural cell width.
 */
export const PRODUCT_GRID_CLASS =
  "grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4";
