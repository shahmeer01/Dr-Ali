import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/icons";

type ProductCardProps = {
  name: string;
  description?: string;
  price?: string;
  imageSrc: string;
  imageAlt: string;
  className?: string;
  /** Detail-page link for the product */
  href?: string;
  brand?: string;
  /** Small status line under the price */
  availability?: string;
  availabilityTone?: "neutral" | "muted";
  /** Renders a demo-data chip */
  demo?: boolean;
  /** Extra element rendered above the title (e.g. category chip) */
  meta?: ReactNode;
  /**
   * Reduced card body: title, two-line description and the WhatsApp action
   * only — hides brand, price, availability line and demo chip, with tighter
   * content padding.
   */
  compact?: boolean;
  /** Optional WhatsApp order/enquiry action pinned to the card bottom */
  whatsapp?: {
    href: string;
    /** Button label, e.g. "Order on WhatsApp" */
    label: string;
  };
};

/**
 * Commerce card: consistent 4:5 media ratio, square-edged image,
 * modestly rounded card shell, readable price. Links to the product
 * detail page when `href` is provided.
 */
export function ProductCard({
  name,
  description,
  price,
  imageSrc,
  imageAlt,
  className,
  href,
  brand,
  availability,
  availabilityTone = "neutral",
  demo = false,
  meta,
  compact = false,
  whatsapp,
}: ProductCardProps) {
  const body = compact ? (
    <div className="flex flex-1 flex-col gap-1.5 p-4">
      <h3 className="text-[16px] font-medium leading-snug tracking-[-0.01em] text-balance text-charcoal transition-colors duration-[180ms] group-hover:text-forest">
        {name}
      </h3>
      {description ? (
        <p className="text-[14px] leading-relaxed text-pretty text-muted line-clamp-2">
          {description}
        </p>
      ) : null}
    </div>
  ) : (
    <div className="flex flex-1 flex-col gap-1 p-5">
      {meta ? <div className="mb-1">{meta}</div> : null}
      {brand ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          {brand}
        </p>
      ) : null}
      <h3 className="text-[16px] font-medium leading-snug text-charcoal transition-colors duration-[180ms] group-hover:text-forest">
        {name}
      </h3>
      {description ? (
        <p className="text-[14px] leading-relaxed text-muted line-clamp-2">
          {description}
        </p>
      ) : null}
      {price ? (
        <p className="mt-2 text-[17px] font-semibold text-forest">{price}</p>
      ) : null}
      {availability ? (
        <p
          className={cn(
            "text-[13px]",
            availabilityTone === "muted" ? "text-muted" : "text-charcoal/80",
          )}
        >
          {availability}
        </p>
      ) : null}
      {demo ? (
        <span className="mt-3 inline-flex w-fit items-center rounded-control border border-amber/40 bg-amber/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a5f34]">
          Demo data
        </span>
      ) : null}
    </div>
  );

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border border-border-subtle bg-white",
        "transition-[box-shadow,border-color] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:border-forest/25 hover:shadow-card-hover focus-within:border-forest/25 focus-within:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sage/50">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
          className="object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
        />
      </div>
      {href ? (
        <Link
          href={href}
          className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-forest"
        >
          {body}
        </Link>
      ) : (
        body
      )}
      {whatsapp ? (
        <div className="flex border-t border-border-subtle px-4 pb-4 pt-3">
          <a
            href={whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${whatsapp.label}: ${name}`}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-control bg-forest px-4 py-2.5 text-[13px] font-medium leading-5 text-white",
              "transition-[background-color,transform,translate] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "hover:-translate-y-0.5 hover:bg-[#1f4f41] active:translate-y-0 active:bg-[#14332a]",
              "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-forest",
            )}
          >
            <WhatsAppIcon className="h-[15px] w-[15px] shrink-0" />
            {whatsapp.label}
          </a>
        </div>
      ) : null}
    </article>
  );
}
