import type { ReactNode } from "react";
import { AlertTriangle, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { waLink } from "@/lib/whatsapp";

type StatePanelProps = {
  title: string;
  body: string;
  /** Action row (buttons/links), centred below the copy. */
  children?: ReactNode;
  /** "solid" = structural states (empty category, error); "soft" = transient search misses. */
  variant?: "solid" | "soft";
  icon?: ReactNode;
  className?: string;
};

/**
 * Centred message panel for catalogue states. Structural states use a
 * solid white card (calm, deliberate); search misses use a dashed,
 * lighter panel so they read as transient rather than broken.
 */
export function StatePanel({
  title,
  body,
  children,
  variant = "solid",
  icon,
  className,
}: StatePanelProps) {
  return (
    <div
      className={cn(
        "rounded-card border px-6 py-10 text-center sm:py-12",
        variant === "solid"
          ? "border-border-subtle bg-white"
          : "border-dashed border-border-subtle bg-white/70",
        className,
      )}
    >
      {icon ? (
        <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-control border border-border-subtle bg-ivory text-forest">
          {icon}
        </span>
      ) : null}
      <h2
        className={cn(
          "text-balance text-[19px] font-medium tracking-[-0.01em] text-charcoal sm:text-[20px]",
          icon ? "mt-4" : undefined,
        )}
      >
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">
        {body}
      </p>
      {children ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}

type CatalogueErrorStateProps = {
  /** Same-route link that re-runs the server fetch (retry). */
  retryHref: string;
  /** Prefilled WhatsApp message for this context. */
  whatsappMessage: string;
};

/**
 * Database/network failure state for a catalogue surface. Shown when the
 * product query throws — kept visually distinct from empty categories so
 * an outage never reads as "no stock", and an empty category never reads
 * as an outage.
 */
export function CatalogueErrorState({
  retryHref,
  whatsappMessage,
}: CatalogueErrorStateProps) {
  return (
    <StatePanel
      icon={<AlertTriangle className="h-5 w-5 text-amber" aria-hidden="true" />}
      title="We couldn't load this catalogue"
      body="The product service didn't respond. This is a connection problem, not an empty shelf — try again, or reach the practice directly."
    >
      <Button href={retryHref} size="md" variant="primary">
        Try again
      </Button>
      <Button
        href={waLink(whatsappMessage)}
        size="md"
        variant="secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Message on WhatsApp
      </Button>
      <Button href={siteConfig.phoneHref} size="md" variant="secondary">
        <Phone className="h-4 w-4" aria-hidden="true" />
        Call the practice
      </Button>
    </StatePanel>
  );
}
