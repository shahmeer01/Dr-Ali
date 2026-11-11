import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <li>
          <Link
            href="/"
            className="transition-colors duration-[180ms] hover:text-forest hover:underline underline-offset-2"
          >
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            <ChevronRight
              className="h-3.5 w-3.5 text-muted/60"
              aria-hidden="true"
            />
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors duration-[180ms] hover:text-forest hover:underline underline-offset-2"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-charcoal">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
