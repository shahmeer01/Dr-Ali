import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import type { PublicCategory } from "@/lib/product-shared";
import { generalEnquiryMessage, waLink } from "@/lib/whatsapp";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Pet Care", href: "/pet-care" },
  { label: "Livestock", href: "/livestock" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Footer link text: soft muted white lifting to full white, with a light
 *  focus ring that stays visible on the forest surface. */
const linkClass =
  "text-[15px] text-white/80 underline-offset-4 transition-colors duration-[180ms] hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory";

/** Uppercase column labels: subtle tracking, contrast-safe opacity. */
const labelClass =
  "text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70";

export function Footer({ categories }: { categories: PublicCategory[] }) {
  // Hierarchy: top-level categories first (alphabetical, as served), each
  // with its active subcategories nested beneath. A child whose parent is
  // not in the list (e.g. hidden parent) surfaces at the top level.
  const byId = new Map(categories.map((category) => [category.id, category]));
  const childrenByParent = new Map<string, PublicCategory[]>();
  const roots: PublicCategory[] = [];
  for (const category of categories) {
    if (category.parent_category_id && byId.has(category.parent_category_id)) {
      const siblings = childrenByParent.get(category.parent_category_id) ?? [];
      siblings.push(category);
      childrenByParent.set(category.parent_category_id, siblings);
    } else {
      roots.push(category);
    }
  }

  return (
    <footer className="bg-forest text-white/85">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-3 md:py-16 lg:grid-cols-12">
          <div className="md:col-span-3 lg:col-span-4">
            <p className="font-display text-[22px] font-medium text-white">
              {siteConfig.name}
            </p>
            <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.14em] text-white/70">
              {siteConfig.tagline}
            </p>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">
              Veterinary home visits and farm consultations for pets and
              livestock across Lahore, delivered with care and practical
              guidance.
            </p>
          </div>

          <nav aria-label="Explore" className="lg:col-span-2 lg:col-start-5">
            <p className={labelClass}>Explore</p>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Shop by category"
            className="lg:col-span-3 lg:col-start-7"
          >
            <p className={labelClass}>Products</p>
            <ul className="mt-4 space-y-2.5">
              {roots.map((category) => (
                <li key={category.slug}>
                  <Link href={category.href} className={linkClass}>
                    {category.name}
                  </Link>
                  {childrenByParent.get(category.id) ? (
                    <ul className="mt-1.5 ml-3 space-y-1.5 border-l border-white/15 pl-3">
                      {(childrenByParent.get(category.id) as PublicCategory[]).map(
                        (child) => (
                          <li key={child.slug}>
                            <Link
                              href={child.href}
                              className="text-[14px] text-white/65 underline-offset-4 transition-colors duration-[180ms] hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ),
                      )}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3 lg:col-start-10">
            <p className={labelClass}>Contact</p>
            <ul className="mt-4 space-y-3 text-[15px]">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber"
                  aria-hidden="true"
                />
                <span className="text-white/80">{siteConfig.location}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber"
                  aria-hidden="true"
                />
                <a
                  href={siteConfig.phoneHref}
                  className="text-white/80 underline-offset-4 transition-colors duration-[180ms] hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber"
                  aria-hidden="true"
                />
                <a
                  href={waLink(generalEnquiryMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 underline-offset-4 transition-colors duration-[180ms] hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                >
                  WhatsApp enquiry
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-[13px] text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {siteConfig.copyrightYear} {siteConfig.name}. All rights reserved.
          </p>
          <p>{siteConfig.location}</p>
        </div>
      </Container>
    </footer>
  );
}
