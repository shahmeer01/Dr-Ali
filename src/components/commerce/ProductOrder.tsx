"use client";

import { useState, useSyncExternalStore } from "react";
import { Minus, Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { availabilityLabel, type Product } from "@/data/products";
import { waLink } from "@/lib/whatsapp";

type ProductOrderProps = {
  product: Product;
};

// Hydration-safe page URL: server snapshot is empty, client snapshot is the
// real location — React swaps it in after hydration without a mismatch.
const subscribe = () => () => {};
const getClientSnapshot = () => window.location.href;
const getServerSnapshot = () => "";

export function ProductOrder({ product }: ProductOrderProps) {
  const [quantity, setQuantity] = useState(1);
  const pageLink = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const unavailable = product.availability === "unavailable";

  const message = [
    "Hello Dr. Ali Ahmad, I would like to order:",
    `Product: ${product.name}`,
    `Brand: ${product.brand}`,
    `Quantity: ${quantity}`,
    `Price shown: ${product.price} (demo listing)`,
    pageLink ? `Link: ${pageLink}` : "",
    "",
    "Please confirm availability and the total.",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="rounded-card border border-border-subtle bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            Price
          </p>
          <p className="mt-1 text-[26px] font-semibold text-forest">
            {product.price}
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[14px] text-charcoal/80">
            <span
              className={`h-2 w-2 rounded-full ${
                unavailable ? "bg-muted" : "bg-forest"
              }`}
              aria-hidden="true"
            />
            {availabilityLabel[product.availability]}
          </p>
        </div>
        <span className="inline-flex items-center rounded-control border border-amber/40 bg-amber/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a5f34]">
          Demo data
        </span>
      </div>

      <div className="mt-6">
        <p
          id="qty-label"
          className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted"
        >
          Quantity
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="inline-flex h-11 items-center rounded-control border border-border-subtle bg-white">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control text-charcoal transition-colors hover:bg-charcoal/[0.05] disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <output
              aria-labelledby="qty-label"
              className="min-w-10 text-center text-[15px] font-medium text-charcoal"
            >
              {quantity}
            </output>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              disabled={quantity >= 99}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control text-charcoal transition-colors hover:bg-charcoal/[0.05] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <Button
        href={waLink(message)}
        size="lg"
        variant="primary"
        className="mt-6 w-full"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {unavailable
          ? "Ask about availability on WhatsApp"
          : "Order on WhatsApp"}
      </Button>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        Opens WhatsApp with the product name, quantity, and page link
        prefilled. Availability is confirmed on chat.
      </p>
    </div>
  );
}
