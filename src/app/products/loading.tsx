import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PRODUCT_GRID_CLASS } from "@/components/commerce/productGrid";

/**
 * Route-level loading state for the catalogue (index, category pages,
 * and product detail). Renders instantly under the PPR shell while the
 * dynamic server content streams in.
 */
export default function ProductsLoading() {
  return (
    <div role="status" aria-label="Loading catalogue">
      <span className="sr-only">Loading products…</span>
      <div aria-hidden="true">
      <div className="bg-ivory">
        <Container>
          <div className="py-4">
            <div className="h-3.5 w-40 animate-pulse rounded bg-sage/60" />
          </div>
          <div className="pb-8 pt-1 md:pb-10">
            <div className="h-3 w-20 animate-pulse rounded bg-sage/60" />
            <div className="mt-4 h-9 w-2/3 max-w-lg animate-pulse rounded bg-sage/60 sm:h-11" />
            <div className="mt-5 h-4 w-full max-w-2xl animate-pulse rounded bg-sage/40" />
            <div className="mt-2.5 h-4 w-3/4 max-w-xl animate-pulse rounded bg-sage/40" />
          </div>
        </Container>
      </div>
      <Section surface="ivory" spacing="tight">
        <div className="flex gap-2.5">
          {[72, 96, 88, 104, 92].map((w, i) => (
            <div
              key={i}
              className="h-10 shrink-0 animate-pulse rounded-control bg-sage/50"
              style={{ width: w }}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-full animate-pulse rounded-control bg-sage/40 sm:max-w-xs" />
          <div className="h-10 w-40 animate-pulse rounded-control bg-sage/40" />
        </div>
        <div className={`mt-5 ${PRODUCT_GRID_CLASS}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-card border border-border-subtle bg-white"
            >
              <div className="aspect-[4/5] w-full animate-pulse bg-sage/40" />
              <div className="space-y-2.5 p-5">
                <div className="h-3 w-1/3 animate-pulse rounded bg-sage/50" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-sage/50" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-sage/40" />
              </div>
            </div>
          ))}
        </div>
      </Section>
      </div>
    </div>
  );
}
