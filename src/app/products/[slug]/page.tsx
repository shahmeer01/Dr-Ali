import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Reveal, MediaReveal } from "@/components/motion/Reveal";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductOrder } from "@/components/commerce/ProductOrder";
import { CategoryPageView } from "@/components/commerce/CategoryPageView";
import { PRODUCT_GRID_CLASS } from "@/components/commerce/productGrid";
import {
  availabilityLabel,
} from "@/data/products";
import {
  fetchCatalogProducts,
  fetchProductBySlug,
  fetchPublicCategories,
  fetchPublicCategoryBySlug,
  relatedProducts,
} from "@/lib/catalog";
import { waLink } from "@/lib/whatsapp";

// Product data is fetched per request (Supabase + RLS; admins also see drafts).
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (product) {
    return {
      title: product.name,
      description: product.description,
    };
  }
  // Slug may belong to an active category (dynamic category route).
  const category = await fetchPublicCategoryBySlug(slug);
  if (category) {
    return {
      title: category.name,
      description: category.description,
    };
  }
  // Throwing here (before the PPR shell flushes) yields a true 404 status
  // instead of a 200 shell that later streams the not-found boundary.
  notFound();
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) {
    // Product-first: an existing published product always wins the slug.
    // Otherwise fall back to an active category, else 404.
    const category = await fetchPublicCategoryBySlug(slug);
    if (!category) notFound();
    return <CategoryPageView slug={slug} />;
  }

  const categories = await fetchPublicCategories();
  const category = categories.find((item) => item.slug === product.category);
  const allProducts = await fetchCatalogProducts();
  const related = relatedProducts(allProducts, product);

  return (
    <>
      <div className="bg-ivory">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Products", href: "/products" },
              {
                label: category?.name ?? "Products",
                href: category?.href,
              },
              { label: product.name },
            ]}
          />
          <Reveal immediate delay={0} className="pb-6 pt-2">
            <Link
              href={category?.href ?? "/products"}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-forest transition-opacity hover:opacity-80"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to {category?.name ?? "products"}
            </Link>
          </Reveal>
        </Container>
      </div>

      {/* Product hero: media + order panel */}
      <Section surface="ivory" spacing="tight">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <MediaReveal delay={0.08}>
              <ProductGallery
                key={product.slug}
                images={product.images}
                name={product.name}
                priority
              />
            </MediaReveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal immediate delay={0.1}>
              {product.brand ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {product.brand}
                </p>
              ) : null}
              <h1
                className={
                  product.brand
                    ? "mt-2 text-display text-balance text-[30px] text-charcoal sm:text-[38px]"
                    : "text-display text-balance text-[30px] text-charcoal sm:text-[38px]"
                }
              >
                {product.name}
              </h1>
              {product.size ? (
                <p className="mt-2 text-[15px] text-muted">
                  Pack size: {product.size}
                </p>
              ) : null}
              <p className="mt-4 text-[16px] leading-relaxed text-muted">
                {product.description}
              </p>
            </Reveal>

            <Reveal immediate delay={0.18} className="mt-8">
              <ProductOrder product={product} />
            </Reveal>

            <Reveal immediate delay={0.24} className="mt-6">
              <Button
                href={waLink(
                  `Hello Dr. Ali Ahmad, I have a question about ${product.name}.`,
                )}
                size="md"
                variant="secondary"
                className="w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Ask a question
              </Button>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Details */}
      <Section surface="white" spacing="default">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <h2 className="text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
              Product details
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              {product.details ?? product.description}
            </p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
            <dl className="divide-y divide-border-subtle rounded-card border border-border-subtle bg-white">
              {product.availability ? (
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <dt className="text-[14px] text-muted">Availability</dt>
                  <dd className="text-[15px] font-medium text-charcoal">
                    {availabilityLabel[product.availability]}
                  </dd>
                </div>
              ) : null}
              {product.size ? (
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <dt className="text-[14px] text-muted">Pack size</dt>
                  <dd className="text-[15px] font-medium text-charcoal">
                    {product.size}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-[14px] text-muted">Category</dt>
                <dd>
                  <Link
                    href={category?.href ?? "/products"}
                    className="text-[15px] font-medium text-forest hover:underline"
                  >
                    {category?.name ?? "Products"}
                  </Link>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-[14px] text-muted">Price</dt>
                <dd className="text-[15px] font-medium text-charcoal">
                  {product.price ? (
                    <span className="inline-flex flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5">
                      <span>{product.price}</span>
                      {product.comparePrice ? (
                        <s className="text-[14px] font-normal text-muted">
                          {product.comparePrice}
                        </s>
                      ) : null}
                      {product.discountPercent != null ? (
                        <span className="text-[13px] font-semibold text-forest">
                          -{product.discountPercent}%
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    "Confirmed on WhatsApp"
                  )}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Section>

      {/* Related */}
      {related.length > 0 ? (
        <Section surface="ivory" spacing="default">
          <Reveal>
            <h2 className="text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
              Related products
            </h2>
          </Reveal>
          <div className={`mt-8 ${PRODUCT_GRID_CLASS}`}>
            {related.map((item, i) => (
              <Reveal key={item.slug} staggerIndex={i}>
                <ProductCard
                  href={`/products/${item.slug}`}
                  name={item.name}
                  brand={item.brand}
                  size={item.size}
                  description={item.description}
                  price={item.price}
                  comparePrice={item.comparePrice}
                  discountPercent={item.discountPercent}
                  imageSrc={item.image}
                  imageAlt={item.imageAlt}
                  availability={item.availability}
                  whatsapp={{
                    href: waLink(
                      `Hello Dr. Ali Ahmad, I would like to ask about ${
                        item.brand ? `${item.brand} ` : ""
                      }${item.name}. Please share current availability and pricing.`,
                    ),
                    label: "Enquire",
                  }}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      <WhatsAppBand
        title="Order or enquire"
        body="Send the product name and quantity — availability and pricing are confirmed on WhatsApp."
        whatsappMessage={`Hello Dr. Ali Ahmad, I would like to order: ${product.name}. Quantity:`}
      />
    </>
  );
}
