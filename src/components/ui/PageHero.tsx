import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal, MediaReveal } from "@/components/motion/Reveal";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  /** Full size ladder for the title (overrides the default 36/46/60) */
  titleClassName?: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  /** Aspect-ratio classes for the media (overrides the default 4/5–5/4–4/5) */
  imageAspect?: string;
  /** Vertical padding ladder for the section (overrides the default rhythm) */
  paddingClassName?: string;
  actions?: ReactNode;
  /** Square-edged editorial media on the right (default) or full-width below */
  className?: string;
};

/**
 * Shared inner-page hero: staggered text entrance + media reveal.
 * Mirrors the homepage hero proportions and rounded media treatment.
 */
export function PageHero({
  eyebrow,
  title,
  titleClassName,
  description,
  imageSrc,
  imageAlt,
  imageAspect,
  paddingClassName,
  actions,
  className,
}: PageHeroProps) {
  const titleSizes =
    titleClassName ?? "text-[36px] sm:text-[46px] lg:text-[60px]";
  const aspectClasses = imageAspect ?? "aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]";
  const padding = paddingClassName ?? "pb-14 pt-10 md:pb-20 md:pt-16 lg:pb-24 lg:pt-20";
  return (
    <section
      className={`bg-ivory ${padding} ${className ?? ""}`}
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6 xl:col-span-5">
            {eyebrow ? (
              <Reveal immediate delay={0}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
                  {eyebrow}
                </p>
              </Reveal>
            ) : null}
            <Reveal immediate delay={0.06}>
              <h1 className={`mt-4 text-display text-balance text-charcoal ${titleSizes}`}>
                {title}
              </h1>
            </Reveal>
            {description ? (
              <Reveal immediate delay={0.14}>
                <p className="mt-5 max-w-md text-pretty text-[17px] leading-relaxed text-muted md:text-[18px]">
                  {description}
                </p>
              </Reveal>
            ) : null}
            {actions ? (
              <Reveal immediate delay={0.22}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {actions}
                </div>
              </Reveal>
            ) : null}
          </div>

          <div className="lg:col-span-6 lg:col-start-7 xl:col-span-7">
            <MediaReveal delay={0.12}>
              <div className={`relative ${aspectClasses} w-full overflow-hidden rounded-[20px] bg-sage shadow-[0_24px_60px_-32px_rgba(24,61,50,0.4)]`}>
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 48vw"
                  className="object-cover"
                />
              </div>
            </MediaReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
