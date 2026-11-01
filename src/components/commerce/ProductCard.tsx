import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { availabilityLabel, type ProductAvailability } from "@/data/products";
import { WhatsAppIcon } from "@/components/ui/icons";

type ProductCardProps = {
  name: string;
  /** Verified brand — rendered only when supplied. */
  brand?: string;
  /** Verified pack size — rendered only when supplied. */
  size?: string;
  description?: string;
  /** Verified price — never rendered when absent (no placeholder values). */
  price?: string;
  /** Verified availability — rendered only when supplied. */
  availability?: ProductAvailability;
  /** Product photography; falls back to a neutral panel when absent. */
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  /** Product-detail link. Enables the card-wide link + "View details" action. */
  href?: string;
  /** Extra element rendered above the brand line (e.g. category chip). */
  meta?: ReactNode;
  /**
   * Reduced card body: title and a two-line description only — hides brand,
   * pack size, price, and availability, with tighter content padding.
   */
  compact?: boolean;
  /** WhatsApp enquiry action pinned to the card bottom. */
  whatsapp?: {
    href: string;
    /** Button label, e.g. "Enquire" */
    label: string;
  };
};

const availabilityDot: Record<ProductAvailability, string> = {
  "in-stock": "bg-forest",
  "on-request": "bg-amber",
  unavailable: "bg-muted",
};

/** Detail action: text link with a nudging arrow on card hover. */
const detailActionClass =
  "group/action inline-flex items-center gap-1.5 text-[13px] font-medium leading-5 text-forest transition-colors duration-[180ms] hover:text-[#1f4f41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

/** Enquiry action: bordered pill with the WhatsApp mark. */
const enquiryActionClass =
  "ml-auto inline-flex items-center gap-1.5 whitespace-nowrap rounded-control border border-forest/25 px-2.5 py-1.5 text-[13px] font-medium leading-5 text-forest transition-[background-color,border-color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-forest/50 hover:bg-forest/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

/**
 * Catalogue card: uniform 4:5 media frame with `object-contain` packaging
 * fit, verified meta lines only (brand, name, pack size, description,
 * price, availability), a card-wide detail link, and explicit detail /
 * WhatsApp actions in the footer.
 */
export function ProductCard({
  name,
  brand,
  size,
  description,
  price,
  availability,
  imageSrc,
  imageAlt,
  className,
  href,
  meta,
  compact = false,
  whatsapp,
}: ProductCardProps) {
  const media = (
    <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-border-subtle bg-sage/40">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt ?? name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Package className="h-7 w-7 text-forest/30" aria-hidden="true" />
        </div>
      )}
    </div>
  );

  const body = compact ? (
    <div className="flex flex-1 flex-col gap-1.5 p-4">
      <h3 className="text-balance text-[16px] font-medium leading-snug tracking-[-0.01em] text-charcoal transition-colors duration-[180ms] group-hover:text-forest">
        {name}
      </h3>
      {description ? (
        <p className="line-clamp-2 text-[14px] leading-relaxed text-pretty text-muted">
          {description}
        </p>
      ) : null}
    </div>
  ) : (
    <div className="flex flex-1 flex-col p-5">
      {meta ? <div className="mb-1.5">{meta}</div> : null}
      {brand ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {brand}
        </p>
      ) : null}
      <h3
        className={cn(
          "text-balance text-[16px] font-medium leading-snug tracking-[-0.01em] text-charcoal transition-colors duration-[180ms] group-hover:text-forest",
          brand ? "mt-1" : undefined,
        )}
      >
        {name}
      </h3>
      {size ? (
        <p className="mt-1.5 text-[13px] leading-5 text-muted">
          Pack size: {size}
        </p>
      ) : null}
      {description ? (
        <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {price || availability ? (
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4">
          {price ? (
            <p className="text-[16px] font-semibold leading-6 text-forest">
              {price}
            </p>
          ) : null}
          {availability ? (
            <p
              className={cn(
                "inline-flex items-center gap-1.5 text-[13px] leading-5",
                price ? "text-charcoal/75" : "text-charcoal/85",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  availabilityDot[availability],
                )}
                aria-hidden="true"
              />
              {availabilityLabel[availability]}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const footer = whatsapp || href ? (
    <div className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-2 border-t border-border-subtle bg-white px-4 py-3">
      {href ? (
        <Link
          href={href}
          className={detailActionClass}
          aria-label={`View details: ${name}`}
        >
          View details
          <ArrowRight
            className="h-3.5 w-3.5 shrink-0 transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/action:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
      {whatsapp ? (
        <a
          href={whatsapp.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${whatsapp.label}: ${name}`}
          className={enquiryActionClass}
        >
          <WhatsAppIcon className="h-[14px] w-[14px] shrink-0" />
          {whatsapp.label}
        </a>
      ) : null}
    </div>
  ) : null;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border border-border-subtle bg-white",
        "transition-[box-shadow,border-color] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:border-forest/25 hover:shadow-card-hover focus-within:border-forest/25 focus-within:shadow-card-hover",
        className,
      )}
    >
      {href ? (
        <Link
          href={href}
          className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-forest"
        >
          {media}
          {body}
        </Link>
      ) : (
        <div className="flex flex-1 flex-col">
          {media}
          {body}
        </div>
      )}
      {footer}
    </article>
  );
}
