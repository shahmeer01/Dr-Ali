"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";

export type ProductFilterValues = {
  q: string;
  category: string;
  status: string;
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

const controlClass =
  "h-10 w-full rounded-control border border-border-subtle bg-white px-3 text-[14px] text-charcoal transition-[border-color,box-shadow] duration-[180ms] placeholder:text-muted focus:border-forest focus:shadow-[0_0_0_3px_rgba(24,61,50,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

/**
 * Search + filter bar for the admin product table. Filters live in the
 * URL (shareable, back-button friendly); changes navigate immediately.
 */
export function ProductFilters({
  values,
  categories,
}: {
  values: ProductFilterValues;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (next: ProductFilterValues) => {
      const params = new URLSearchParams();
      if (next.q) params.set("q", next.q);
      if (next.category) params.set("category", next.category);
      if (next.status) params.set("status", next.status);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `/admin/products?${qs}` : "/admin/products", { scroll: false });
      });
    },
    [router],
  );

  const hasFilters = Boolean(values.q || values.category || values.status);

  return (
    <form
      role="search"
      aria-label="Filter products"
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        navigate({
          q: String(data.get("q") ?? "").trim(),
          category: String(data.get("category") ?? ""),
          status: String(data.get("status") ?? ""),
        });
      }}
    >
      <div className="min-w-[220px] flex-1">
        <label
          htmlFor="admin-product-search"
          className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted"
        >
          Search by name
        </label>
        <div className="relative mt-1.5">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="admin-product-search"
            name="q"
            type="search"
            defaultValue={values.q}
            placeholder="Product name…"
            maxLength={100}
            className={[controlClass, "pl-9"].join(" ")}
          />
        </div>
      </div>

      <div className="w-[190px]">
        <label
          htmlFor="admin-product-category"
          className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted"
        >
          Category
        </label>
        <select
          id="admin-product-category"
          name="category"
          defaultValue={values.category}
          className={[controlClass, "mt-1.5"].join(" ")}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.is_active ? "" : " (inactive)"}
            </option>
          ))}
        </select>
      </div>

      <div className="w-[160px]">
        <label
          htmlFor="admin-product-status"
          className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted"
        >
          Status
        </label>
        <select
          id="admin-product-status"
          name="status"
          defaultValue={values.status}
          className={[controlClass, "mt-1.5"].join(" ")}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="flex items-center gap-2 pb-0.5">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-control bg-forest px-4 text-[14px] font-medium text-white transition-colors duration-[180ms] hover:bg-[#1f4f41] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          {isPending ? "Applying…" : "Apply"}
        </button>
        {hasFilters ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => navigate({ q: "", category: "", status: "" })}
            className="inline-flex h-10 items-center gap-1.5 rounded-control border border-border-subtle px-3 text-[14px] font-medium text-charcoal transition-colors duration-[180ms] hover:border-forest/40 hover:text-forest disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>
    </form>
  );
}
