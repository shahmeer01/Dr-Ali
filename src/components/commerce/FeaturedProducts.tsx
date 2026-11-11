import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { ProductCard } from "@/components/commerce/ProductCard";
import { PRODUCT_GRID_CLASS } from "@/components/commerce/productGrid";
import { waLink } from "@/lib/whatsapp";
import { fetchFeaturedProducts } from "@/lib/catalog";

/**
 * Homepage "Selected products" teaser — featured, published picks from
 * Supabase. Renders nothing until the practice features products, so the
 * section never shows placeholder items. Streamed behind a Suspense
 * boundary on the homepage so the rest of the page stays prerendered.
 */
export async function FeaturedProducts() {
  const featured = await fetchFeaturedProducts(4);
  if (featured.length === 0) return null;

  return (
    <Section surface="ivory" spacing="default">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
            Catalog
          </p>
          <h2 className="mt-2 max-w-lg text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
            Selected products
          </h2>
        </div>
        <Button href="/products" size="md" variant="ghost">
          View all products
        </Button>
      </Reveal>

      <div className={`mt-10 ${PRODUCT_GRID_CLASS}`}>
        {featured.map((product, i) => {
          const isUnavailable = product.availability === "unavailable";
          const waLabel = isUnavailable
            ? "Enquire on WhatsApp"
            : "Order on WhatsApp";
          const waMessage = isUnavailable
            ? `Assalam-o-Alaikum, I would like to enquire about ${product.name}. Please share restock availability and the price.`
            : `Assalam-o-Alaikum, I would like to enquire about ordering ${product.name}. Please share the price and availability.`;
          return (
            <Reveal key={product.slug} staggerIndex={i}>
              <ProductCard
                compact
                href={`/products/${product.slug}`}
                name={product.name}
                description={product.description}
                price={product.price}
                comparePrice={product.comparePrice}
                discountPercent={product.discountPercent}
                imageSrc={product.image}
                imageAlt={product.imageAlt}
                whatsapp={{ href: waLink(waMessage), label: waLabel }}
                className="h-full"
              />
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
