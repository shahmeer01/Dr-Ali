import type { Metadata } from "next";
import Link from "next/link";
import {
  Boxes,
  Eye,
  EyeOff,
  FolderTree,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { fetchCatalogStats } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const instant = false;

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-border-subtle bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">
          {label}
        </p>
        <span className="text-forest/70" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-[34px] font-medium leading-none tracking-[-0.02em] text-charcoal">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

export default async function AdminHomePage() {
  const stats = await fetchCatalogStats();

  return (
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-charcoal sm:text-[36px]">
            Dashboard
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            Catalogue overview — live from the database.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/products" variant="secondary" size="md">
            <Boxes className="h-4 w-4" aria-hidden="true" />
            View products
          </Button>
          <Button href="/admin/products/new" variant="primary" size="md">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total products"
          value={stats.totalProducts}
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatCard
          label="Published"
          value={stats.publishedProducts}
          icon={<Eye className="h-5 w-5" />}
          hint="Visible on the public website"
        />
        <StatCard
          label="Drafts"
          value={stats.draftProducts}
          icon={<EyeOff className="h-5 w-5" />}
          hint="Hidden from the public website"
        />
        <StatCard
          label="Categories"
          value={stats.totalCategories}
          icon={<FolderTree className="h-5 w-5" />}
        />
      </div>

      <section className="mt-10 rounded-card border border-border-subtle bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4 md:px-6">
          <h2 className="font-display text-[19px] font-medium tracking-[-0.01em] text-charcoal">
            Recently added
          </h2>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-[14px] font-medium text-forest transition-opacity hover:opacity-80"
          >
            All products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {stats.recentProducts.length === 0 ? (
          <p className="px-5 py-8 text-center text-[15px] text-muted md:px-6">
            No products yet. Use “Add product” to create the first listing.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {stats.recentProducts.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-[180ms] hover:bg-ivory/60 md:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-charcoal">
                      {product.name}
                    </p>
                    <p className="mt-0.5 truncate text-[13px] text-muted">
                      {product.categoryName ?? "Uncategorised"} · added{" "}
                      {formatDate(product.created_at)}
                    </p>
                  </div>
                  <span
                    className={
                      product.is_published
                        ? "inline-flex shrink-0 items-center rounded-control bg-sage/60 px-2.5 py-1 text-[12px] font-medium text-forest"
                        : "inline-flex shrink-0 items-center rounded-control bg-charcoal/[0.08] px-2.5 py-1 text-[12px] font-medium text-muted"
                    }
                  >
                    {product.is_published ? "Published" : "Draft"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
