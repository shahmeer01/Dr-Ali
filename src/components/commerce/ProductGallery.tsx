"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { ProductGalleryImage } from "@/data/products";

/**
 * Public product-page gallery: main image with a thumbnail strip, prev/next
 * controls, and horizontal touch swipe. Starts on the primary image; with a
 * single image the controls disappear; with none it falls back to the neutral
 * package panel (the legacy single-image look).
 *
 * The page keys this component by slug, so navigating between products
 * remounts it and the state re-seeds on the new product's primary image.
 */
export function ProductGallery({
  images,
  name,
  priority = false,
}: {
  images?: ProductGalleryImage[];
  name: string;
  priority?: boolean;
}) {
  const gallery = images ?? [];
  const primaryIndex = gallery.findIndex((item) => item.isPrimary);
  const [index, setIndex] = useState(primaryIndex >= 0 ? primaryIndex : 0);
  const touchStartX = useRef<number | null>(null);

  if (gallery.length === 0) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-border-subtle bg-sage/40 sm:aspect-square">
        <div className="flex h-full w-full items-center justify-center">
          <Package className="h-10 w-10 text-forest/30" aria-hidden="true" />
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(index, gallery.length - 1);
  const current = gallery[safeIndex];
  const showControls = gallery.length > 1;

  const goTo = (next: number) => {
    setIndex((next + gallery.length) % gallery.length);
  };

  return (
    <div>
      <div
        className="relative aspect-[4/5] w-full overflow-hidden border border-border-subtle bg-sage/40 sm:aspect-square"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current == null) return;
          const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) > 40) goTo(safeIndex + (delta < 0 ? 1 : -1));
        }}
      >
        <Image
          src={current.src}
          alt={current.alt || name}
          fill
          priority={priority && safeIndex === primaryIndex}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-contain p-6"
        />

        {showControls ? (
          <>
            <button
              type="button"
              onClick={() => goTo(safeIndex - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white hover:text-forest"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(safeIndex + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white hover:text-forest"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium tabular-nums text-charcoal"
            >
              {safeIndex + 1} / {gallery.length}
            </span>
          </>
        ) : null}
      </div>

      {showControls ? (
        <ul
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          aria-label="Product images"
        >
          {gallery.map((item, itemIndex) => (
            <li key={`${item.src}-${itemIndex}`} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(itemIndex)}
                aria-label={`Show image ${itemIndex + 1}`}
                aria-current={itemIndex === safeIndex ? "true" : undefined}
                className={[
                  "relative block h-16 w-16 overflow-hidden rounded-control border-2 transition-colors",
                  itemIndex === safeIndex
                    ? "border-forest"
                    : "border-border-subtle hover:border-forest/40",
                ].join(" ")}
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                {item.isPrimary ? (
                  <span className="sr-only">(primary image)</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
