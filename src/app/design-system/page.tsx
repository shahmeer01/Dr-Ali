import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { colors, layout, motionTokens, radius, typography } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Design System",
  description:
    "Visual design system reference for the Dr. Ali Ahmad veterinary brand.",
};

const swatches = [
  { name: "Forest", token: "forest", hex: colors.forest, usage: "Primary brand, headers, primary buttons, footer" },
  { name: "Ivory", token: "ivory", hex: colors.ivory, usage: "Default page background" },
  { name: "Sage", token: "sage", hex: colors.sage, usage: "Alternate section surfaces, subtle tints" },
  { name: "Amber", token: "amber", hex: colors.amber, usage: "Sparing accents, icons, highlights only" },
  { name: "Charcoal", token: "charcoal", hex: colors.charcoal, usage: "Body text, headings on light surfaces" },
  { name: "White", token: "surface", hex: colors.surface, usage: "Cards, elevated surfaces" },
  { name: "Border", token: "border-subtle", hex: colors.border, usage: "Dividers, card borders" },
  { name: "Muted", token: "muted", hex: colors.muted, usage: "Secondary text, captions" },
] as const;

const typeScale = [
  { label: "Hero (Playfair)", sample: "Compassionate care", className: "text-display text-[40px] md:text-[64px]" },
  { label: "Section heading (DM Sans)", sample: "Services with clarity", className: "text-[32px] md:text-[44px] font-medium tracking-[-0.02em]" },
  { label: "Editorial heading (Playfair)", sample: "For every animal", className: "font-display text-[28px] md:text-[36px] font-medium" },
  { label: "Body (DM Sans)", sample: "Readable body copy at 16–18px with controlled line length.", className: "text-[17px] leading-relaxed text-charcoal" },
  { label: "Secondary / caption", sample: "Supporting detail and metadata", className: "text-[14px] text-muted" },
  { label: "Nav / label", sample: "NAVIGATION LABEL", className: "text-[13px] font-medium uppercase tracking-[0.12em]" },
] as const;

const spacingSteps = [
  { name: "Section mobile", value: "56–72px" },
  { name: "Section desktop", value: "88–120px" },
  { name: "Container max", value: `${layout.containerMax}px` },
  { name: "Grid base", value: "8px increments" },
] as const;

export default function DesignSystemPage() {
  return (
    <>
      <Section surface="ivory" spacing="tight" className="border-b border-border-subtle">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
          Foundation
        </p>
        <h1 className="mt-3 max-w-2xl text-display text-[40px] text-charcoal md:text-[56px]">
          Design system
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">
          Authoritative tokens, type, components, and motion rules for the
          Dr. Ali Ahmad veterinary brand. Use this page for visual QA before
          building product pages.
        </p>
      </Section>

      {/* Colors */}
      <Section surface="white" spacing="default">
        <Reveal>
          <h2 className="text-[28px] font-medium tracking-[-0.02em] md:text-[36px]">
            Color tokens
          </h2>
          <p className="mt-2 max-w-xl text-[16px] text-muted">
            Predominantly light backgrounds, forest-green branding, subtle
            sage sections, sparing amber accents. No competing palettes.
          </p>
        </Reveal>

        <Reveal className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {swatches.map((swatch, i) => (
            <Reveal key={swatch.token} staggerIndex={i} className="h-full">
              <div className="flex h-full flex-col overflow-hidden rounded-card border border-border-subtle bg-white">
                <div
                  className="h-24 w-full border-b border-border-subtle"
                  style={{ backgroundColor: swatch.hex }}
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="text-[15px] font-medium text-charcoal">
                    {swatch.name}
                  </p>
                  <p className="font-mono text-[13px] text-muted">{swatch.hex}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    {swatch.usage}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </Reveal>
      </Section>

      {/* Typography */}
      <Section surface="ivory" spacing="default">
        <Reveal>
          <h2 className="text-[28px] font-medium tracking-[-0.02em] md:text-[36px]">
            Typography
          </h2>
          <p className="mt-2 max-w-xl text-[16px] text-muted">
            {typography.sans} for UI and body. {typography.display} only for
            editorial hero headlines and a few high-impact headings.
          </p>
        </Reveal>

        <div className="mt-10 divide-y divide-border-subtle border-y border-border-subtle">
          {typeScale.map((row) => (
            <Reveal key={row.label} className="grid gap-2 py-8 md:grid-cols-12 md:gap-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted md:col-span-3 md:pt-2">
                {row.label}
              </p>
              <p className={`md:col-span-9 ${row.className}`}>{row.sample}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Layout & spacing */}
      <Section surface="sage" spacing="default">
        <Reveal>
          <h2 className="text-[28px] font-medium tracking-[-0.02em] md:text-[36px]">
            Layout &amp; spacing
          </h2>
        </Reveal>
        <Reveal className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {spacingSteps.map((step, i) => (
            <Reveal key={step.name} staggerIndex={i}>
              <div className="rounded-card border border-forest/10 bg-white/70 p-5">
                <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-muted">
                  {step.name}
                </p>
                <p className="mt-2 text-[22px] font-medium text-forest">
                  {step.value}
                </p>
              </div>
            </Reveal>
          ))}
        </Reveal>
        <Reveal className="mt-8 rounded-card border border-forest/10 bg-white/70 p-6">
          <p className="text-[15px] leading-relaxed text-charcoal">
            Editorial image layouts stay square-edged (radius{" "}
            <code className="rounded bg-sage px-1.5 py-0.5 text-[13px]">
              {radius.editorialMedia}
            </code>
            ). Cards and controls use modest radii — control{" "}
            <code className="rounded bg-sage px-1.5 py-0.5 text-[13px]">
              {radius.control}
            </code>
            , card{" "}
            <code className="rounded bg-sage px-1.5 py-0.5 text-[13px]">
              {radius.card}
            </code>
            . Shadows stay restrained.
          </p>
        </Reveal>
      </Section>

      {/* Buttons */}
      <Section surface="white" spacing="default">
        <Reveal>
          <h2 className="text-[28px] font-medium tracking-[-0.02em] md:text-[36px]">
            Buttons
          </h2>
          <p className="mt-2 max-w-xl text-[16px] text-muted">
            Purpose-clear controls. Forest primary, bordered secondary, amber
            only when emphasis is truly needed.
          </p>
        </Reveal>
        <Reveal className="mt-10 flex flex-wrap items-center gap-4">
          <Button variant="primary" size="lg">
            Book a visit
          </Button>
          <Button variant="secondary" size="lg">
            Browse products
          </Button>
          <Button variant="amber" size="lg">
            Contact on WhatsApp
          </Button>
          <Button variant="ghost" size="lg">
            Learn more
          </Button>
        </Reveal>
        <Reveal className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </Reveal>
      </Section>

      {/* Product card */}
      <Section surface="ivory" spacing="default">
        <Reveal>
          <h2 className="text-[28px] font-medium tracking-[-0.02em] md:text-[36px]">
            Product card
          </h2>
          <p className="mt-2 max-w-xl text-[16px] text-muted">
            Consistent 4:5 media ratio with a packaging-friendly contain fit,
            restrained elevation. Layout placeholders only — real prices and
            availability render only when verified data exists.
          </p>
        </Reveal>
        <Reveal className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard
            name="Sample supplement"
            description="Placeholder product for layout QA."
            imageSrc="/placeholder-product.svg"
            imageAlt="Placeholder product image"
          />
          <ProductCard
            name="Sample feed additive"
            description="Placeholder product for layout QA."
            imageSrc="/placeholder-product.svg"
            imageAlt="Placeholder product image"
          />
          <ProductCard
            name="Sample care kit"
            description="Placeholder product for layout QA."
            imageSrc="/placeholder-product.svg"
            imageAlt="Placeholder product image"
          />
        </Reveal>
      </Section>

      {/* Motion */}
      <Section surface="forest" spacing="default" className="text-white">
        <Reveal>
          <h2 className="text-[28px] font-medium tracking-[-0.02em] text-white md:text-[36px]">
            Motion rules
          </h2>
          <p className="mt-2 max-w-2xl text-[16px] text-white/70">
            GSAP + ScrollTrigger for purposeful, restrained motion only.
            Typical duration {motionTokens.duration.fast}–
            {motionTokens.duration.media}s, rise ~{motionTokens.riseY}px,
            once-only section entrances.
          </p>
        </Reveal>
        <Reveal className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "Hero: short staggered fade-up + media clip reveal",
            "Sections: once-only fade-up, 16–24px travel",
            "prefers-reduced-motion disables or simplifies all motion",
          ].map((rule) => (
            <div
              key={rule}
              className="rounded-card border border-white/10 bg-white/[0.06] p-5 text-[15px] leading-relaxed text-white/85"
            >
              {rule}
            </div>
          ))}
        </Reveal>
      </Section>
    </>
  );
}
