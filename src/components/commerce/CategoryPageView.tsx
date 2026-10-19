import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCatalog } from "@/components/commerce/ProductCatalog";
import { Reveal } from "@/components/motion/Reveal";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import {
  getCategoryBySlug,
  getProductsByCategory,
  type ProductCategorySlug,
} from "@/data/products";

type CategoryPageProps = {
  slug: ProductCategorySlug;
};

export function categoryMetadata(slug: ProductCategorySlug): Metadata {
  const category = getCategoryBySlug(slug);
  return {
    title: category ? category.name : "Products",
    description: category?.description,
  };
}

/**
 * Shared category page body. Used by the five static category routes.
 */
export function CategoryPageView({ slug }: CategoryPageProps) {
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  const list = getProductsByCategory(slug);

  return (
    <>
      <div className="bg-ivory">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Products", href: "/products" },
              { label: category.name },
            ]}
          />
          <div className="pb-12 pt-2">
            <Reveal immediate delay={0}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
                Products
              </p>
            </Reveal>
            <Reveal immediate delay={0.06}>
              <h1 className="mt-3 text-display text-balance text-[36px] text-charcoal sm:text-[46px] lg:text-[54px]">
                {category.name}
              </h1>
            </Reveal>
            <Reveal immediate delay={0.12}>
              <p className="mt-4 max-w-xl text-pretty text-[17px] leading-relaxed text-muted">
                {category.description}
              </p>
            </Reveal>
          </div>
        </Container>
      </div>

      <Section surface="ivory" spacing="tight">
        <ProductCatalog products={list} activeCategory={slug} />
      </Section>

      <WhatsAppBand
        title={`Ask about ${category.name.toLowerCase()}`}
        body="Message the practice to check availability, pack sizes, and pricing for any listing."
        whatsappMessage={`Hello Dr. Ali Ahmad, I would like to ask about ${category.name}. Product:`}
      />
    </>
  );
}
