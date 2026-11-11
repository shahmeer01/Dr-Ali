import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, Pencil, Plus, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  fetchAdminProducts,
  fetchAdminCategories,
  ADMIN_PAGE_SIZE,
} from "@/lib/catalog";
import { resolveProductImage, resolveProductPrice } from "@/lib/product-shared";
import { ProductFilters, type ProductFilterValues } from "./ProductFilters";
import { ProductRowActions } from "./ProductRowActions";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export const instant = false;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function availabilityBadge(value: string | null): { label: string; className: string } {
  switch (value) {
    case "in-stock":
      return { label: "In stock", className: "bg-sage/60 text-forest" };
    case "on-request":
      return { label: "On request", className: "bg-amber/25 text-charcoal" };
    case "unavailable":
      return { label: "Unavailable", className: "bg-charcoal/[0.08] text-muted" };
    default:
      return { label: "Not stated", className: "bg-charcoal/[0.05] text-muted" };
  }
}

function buildFilterHref(
  values: ProductFilterValues,
  page: number,
): string {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.category) params.set("category", values.category);
  if (values.status) params.set("status", values.status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const category = typeof params.category === "string" ? params.category : "";
  const statusRaw = typeof params.status === "string" ? params.status : "";
  const status = statusRaw === "published" || statusRaw === "draft" ? statusRaw : undefined;
  const pageRaw = typeof params.page === "string" ? params.page : "";
  const page = /^\d+$/.test(pageRaw) ? Math.max(1, parseInt(pageRaw, 10)) : 1;

  const filters: ProductFilterValues = { q, category, status: status ?? "" };

  const [list, categories] = await Promise.all([
    fetchAdminProducts({
      q: q || undefined,
      categoryId:
        category && UUID_RE.test(category) ? category : undefined,
      status,
      page,
    }),
    fetchAdminCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(list.total / ADMIN_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * ADMIN_PAGE_SIZE;
  const to = Math.min(from + ADMIN_PAGE_SIZE, list.total);

  const saved = params.saved === "1";
  const deleted = params.deleted === "1";

  return (
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-charcoal sm:text-[36px]">
            Products
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            {list.total === 0
              ? "No products yet."
              : `${list.total} product${list.total === 1 ? "" : "s"} in total.`}
          </p>
        </div>
        <Button href="/admin/products/new" variant="primary" size="md">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add product
        </Button>
      </div>

      {saved ? (
        <p
          role="status"
          className="mt-6 rounded-card border border-forest/25 bg-sage/40 px-4 py-3 text-[14px] text-forest"
        >
          Product saved.
        </p>
      ) : null}
      {deleted ? (
        <p
          role="status"
          className="mt-6 rounded-card border border-forest/25 bg-sage/40 px-4 py-3 text-[14px] text-forest"
        >
          Product deleted.
        </p>
      ) : null}

      <div className="mt-6">
        <ProductFilters values={filters} categories={categories} />
      </div>

      {list.rows.length === 0 ? (
        <div className="mt-8 rounded-card border border-border-subtle bg-white px-6 py-14 text-center">
          <Package className="mx-auto h-8 w-8 text-forest/40" aria-hidden="true" />
          <h2 className="mt-4 font-display text-[20px] font-medium text-charcoal">
            {q || category || status ? "No matching products" : "No products yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
            {q || category || status
              ? "Try a different search term or clear the filters."
              : "Create the first product listing to populate the public catalogue."}
          </p>
          {q || category || status ? (
            <div className="mt-5">
              <Button href="/admin/products" variant="secondary" size="sm">
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="mt-5">
              <Button href="/admin/products/new" variant="primary" size="sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add product
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-card border border-border-subtle bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-ivory/60">
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Availability
                  </th>
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {list.rows.map((product) => {
                  const image = resolveProductImage(product.image_path);
                  const availability = availabilityBadge(product.availability);
                  return (
                    <tr key={product.id} className="align-middle">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-control border border-border-subtle bg-sage/30">
                            {image ? (
                              <Image
                                src={image}
                                alt=""
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-5 w-5 text-forest/30" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-[15px] font-medium text-charcoal">
                              <span className="truncate">{product.name}</span>
                              {product.is_featured ? (
                                <Star
                                  className="h-3.5 w-3.5 shrink-0 fill-amber text-amber"
                                  aria-label="Featured"
                                />
                              ) : null}
                            </p>
                            <p className="mt-0.5 truncate text-[13px] text-muted">
                              /{product.slug}
                              {product.brand ? ` · ${product.brand}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[14px] text-charcoal">
                        {product.categories?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[14px] text-charcoal">
                        {(() => {
                          // Same pricing rules as the public catalogue
                          // (shared helper in product-shared.ts).
                          const pricing = resolveProductPrice(product);
                          return (
                            <>
                              {pricing.price ?? "—"}
                              {pricing.comparePrice ? (
                                <s className="ml-2 text-[13px] text-muted">
                                  {pricing.comparePrice}
                                </s>
                              ) : null}
                              {pricing.discountPercent != null ? (
                                <span className="ml-1.5 text-[12px] font-medium text-forest">
                                  -{pricing.discountPercent}%
                                </span>
                              ) : null}
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-control px-2.5 py-1 text-[12px] font-medium ${availability.className}`}
                        >
                          {availability.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={
                            product.is_published
                              ? "inline-flex items-center rounded-control bg-sage/60 px-2.5 py-1 text-[12px] font-medium text-forest"
                              : "inline-flex items-center rounded-control bg-charcoal/[0.08] px-2.5 py-1 text-[12px] font-medium text-muted"
                          }
                        >
                          {product.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {product.is_published ? (
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-9 items-center rounded-control px-2.5 text-[13px] font-medium text-muted transition-colors hover:bg-charcoal/[0.05] hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                            >
                              View
                            </Link>
                          ) : null}
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-charcoal/[0.05] hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          <ProductRowActions
                            id={product.id}
                            name={product.name}
                            isPublished={product.is_published}
                            isFeatured={product.is_featured}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-4 py-3">
            <p className="text-[13px] text-muted" role="status">
              Showing {from + 1}–{to} of {list.total}
            </p>
            <nav aria-label="Product pages" className="flex items-center gap-1.5">
              {safePage > 1 ? (
                <Link
                  href={buildFilterHref(filters, safePage - 1)}
                  className="inline-flex h-9 items-center rounded-control border border-border-subtle px-3 text-[13px] font-medium text-charcoal transition-colors hover:border-forest/40 hover:text-forest"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center rounded-control border border-border-subtle px-3 text-[13px] font-medium text-muted/60">
                  Previous
                </span>
              )}
              <span className="px-2 text-[13px] text-muted">
                Page {safePage} of {totalPages}
              </span>
              {safePage < totalPages ? (
                <Link
                  href={buildFilterHref(filters, safePage + 1)}
                  className="inline-flex h-9 items-center rounded-control border border-border-subtle px-3 text-[13px] font-medium text-charcoal transition-colors hover:border-forest/40 hover:text-forest"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center rounded-control border border-border-subtle px-3 text-[13px] font-medium text-muted/60">
                  Next
                </span>
              )}
            </nav>
          </div>
        </div>
      )}
    </Container>
  );
}
