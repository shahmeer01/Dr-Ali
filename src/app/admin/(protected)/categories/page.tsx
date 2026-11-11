import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CornerDownRight, FolderOpen, Pencil, Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { fetchAdminCategoryList, type AdminCategoryListRow } from "@/lib/catalog";
import { resolveProductImage } from "@/lib/product-shared";
import { CategoryRowActions } from "./CategoryRowActions";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

export const instant = false;

function routeHint(row: AdminCategoryListRow): string | null {
  // Every active category has a public page at /products/<slug>
  // (inactive/hidden ones are 404 to visitors).
  return row.is_active ? `/products/${row.slug}` : null;
}

type HierarchyEntry = {
  row: AdminCategoryListRow;
  depth: number;
  parentName: string | null;
};

/**
 * Depth-first tree: top-level categories alphabetical, each one's
 * subcategories alphabetical directly beneath it. Rows arrive already
 * name-sorted, so filtering preserves the required order per level.
 */
function buildHierarchy(rows: AdminCategoryListRow[]): HierarchyEntry[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const childrenByParent = new Map<string, AdminCategoryListRow[]>();
  const roots: AdminCategoryListRow[] = [];
  for (const row of rows) {
    if (row.parent_category_id && byId.has(row.parent_category_id)) {
      const siblings = childrenByParent.get(row.parent_category_id) ?? [];
      siblings.push(row);
      childrenByParent.set(row.parent_category_id, siblings);
    } else {
      roots.push(row);
    }
  }

  const entries: HierarchyEntry[] = [];
  const walk = (list: AdminCategoryListRow[], depth: number): void => {
    for (const row of list) {
      entries.push({
        row,
        depth,
        parentName:
          depth > 0
            ? (byId.get(row.parent_category_id as string)?.name ?? null)
            : null,
      });
      walk(childrenByParent.get(row.id) ?? [], depth + 1);
    }
  };
  walk(roots, 0);

  // Defensive: any row whose parent link could not be resolved still shows.
  const emitted = new Set(entries.map((entry) => entry.row.id));
  for (const row of rows) {
    if (!emitted.has(row.id)) entries.push({ row, depth: 0, parentName: null });
  }
  return entries;
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const saved = params.saved === "1";
  const deleted = params.deleted === "1";

  const rows = await fetchAdminCategoryList();
  const entries = buildHierarchy(rows);

  return (
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-charcoal sm:text-[36px]">
            Categories
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            {rows.length === 0
              ? "No categories yet."
              : `${rows.length} categor${rows.length === 1 ? "y" : "ies"} in total.`}
          </p>
        </div>
        <Button href="/admin/categories/new" variant="primary" size="md">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add category
        </Button>
      </div>

      {saved ? (
        <p
          role="status"
          className="mt-6 rounded-card border border-forest/25 bg-sage/40 px-4 py-3 text-[14px] text-forest"
        >
          Category saved.
        </p>
      ) : null}
      {deleted ? (
        <p
          role="status"
          className="mt-6 rounded-card border border-forest/25 bg-sage/40 px-4 py-3 text-[14px] text-forest"
        >
          Category deleted.
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-card border border-border-subtle bg-white px-6 py-14 text-center">
          <FolderOpen className="mx-auto h-8 w-8 text-forest/40" aria-hidden="true" />
          <h2 className="mt-4 font-display text-[20px] font-medium text-charcoal">
            No categories yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
            Create a category to group products in the public catalogue.
          </p>
          <div className="mt-5">
            <Button href="/admin/categories/new" variant="primary" size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add category
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-card border border-border-subtle bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-ivory/60">
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Products
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
                {entries.map(({ row: category, depth, parentName }) => {
                  const image = resolveProductImage(category.image_path);
                  const route = routeHint(category);
                  return (
                    <tr key={category.id} className="align-middle">
                      <td className="px-4 py-3.5">
                        <div
                          className="flex items-center gap-3"
                          style={depth > 0 ? { paddingLeft: depth * 24 } : undefined}
                        >
                          {depth > 0 ? (
                            <CornerDownRight
                              className="h-4 w-4 shrink-0 text-forest/50"
                              aria-hidden="true"
                            />
                          ) : null}
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
                                <FolderOpen className="h-5 w-5 text-forest/30" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-medium text-charcoal">
                              {category.name}
                              {depth > 0 ? (
                                <span className="ml-2 inline-flex items-center rounded-control bg-sage/60 px-2 py-0.5 align-middle text-[11px] font-semibold uppercase tracking-[0.06em] text-forest">
                                  Subcategory
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 truncate text-[13px] text-muted">
                              /{category.slug}
                              {route ? ` · ${route}` : ""}
                              {parentName ? ` · under ${parentName}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[260px] px-4 py-3.5 text-[14px] text-muted">
                        <span className="line-clamp-2">{category.description || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5 text-[14px] text-charcoal">
                        {category.product_count}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={
                            category.is_active
                              ? "inline-flex items-center rounded-control bg-sage/60 px-2.5 py-1 text-[12px] font-medium text-forest"
                              : "inline-flex items-center rounded-control bg-charcoal/[0.08] px-2.5 py-1 text-[12px] font-medium text-muted"
                          }
                        >
                          {category.is_active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-charcoal/[0.05] hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          <CategoryRowActions
                            id={category.id}
                            name={category.name}
                            isActive={category.is_active}
                            productCount={category.product_count}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
}
