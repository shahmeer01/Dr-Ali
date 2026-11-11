import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Reveal } from "@/components/motion/Reveal";

type CategoryHeroProps = {
  /** Page title — also the current breadcrumb unless overridden. */
  title: string;
  /** Category description; omitted entirely when empty. */
  description?: string;
  /** Section eyebrow above the title (catalogue context). */
  eyebrow?: string;
  /** Current-page breadcrumb label when it differs from the title. */
  breadcrumbLabel?: string;
};

/**
 * Shared ivory hero band for every category page (curated, seeded, and
 * admin-created). One breadcrumb ladder, one eyebrow, one title scale,
 * one description measure, one vertical rhythm — so all category pages
 * open identically.
 */
export function CategoryHero({
  title,
  description,
  eyebrow = "Products",
  breadcrumbLabel,
}: CategoryHeroProps) {
  return (
    <div className="bg-ivory">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Products", href: "/products" },
            { label: breadcrumbLabel ?? title },
          ]}
        />
        <div className="pb-8 pt-1 md:pb-10">
          <Reveal immediate delay={0}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              {eyebrow}
            </p>
          </Reveal>
          <Reveal immediate delay={0.06}>
            <h1 className="mt-3 text-display text-balance text-[36px] text-charcoal sm:text-[46px] lg:text-[54px]">
              {title}
            </h1>
          </Reveal>
          {description ? (
            <Reveal immediate delay={0.12}>
              <p className="mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-muted">
                {description}
              </p>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
