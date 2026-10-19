import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ProductCatalog } from "@/components/commerce/ProductCatalog";
import { products, productCategories } from "@/data/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Shop pet food, animal feed, grooming supplies, accessories, and healthcare products for dogs, cats, and livestock.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Shop"
        title="Products for pets and livestock"
        description="Food, feed, grooming, accessories, and healthcare — curated selections across five categories."
        imageSrc="/images/dog-food-bowl.jpg"
        imageAlt="Pet food in a clean modern bowl"
      />

      {/* Category tiles */}
      <Section surface="white" spacing="default">
        <Reveal>
          <h2 className="text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
            Browse by category
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productCategories.map((category, i) => (
            <Reveal key={category.slug} staggerIndex={i}>
              <Link
                href={category.href}
                className="group flex h-full flex-col overflow-hidden rounded-card border border-border-subtle bg-white transition-[box-shadow,border-color] duration-[280ms] hover:border-forest/30 hover:shadow-card-hover"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-sage/50">
                  <Image
                    src={category.image}
                    alt={category.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <h3 className="text-[17px] font-medium text-charcoal transition-colors group-hover:text-forest">
                    {category.name}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-muted">
                    {category.description}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Full catalog with client-side filter */}
      <Section id="catalog" surface="ivory" spacing="default">
          <Reveal>
            <h2 className="text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
              All products
            </h2>
          </Reveal>
        <div className="mt-10">
          <ProductCatalog products={products} />
        </div>
      </Section>
    </>
  );
}
