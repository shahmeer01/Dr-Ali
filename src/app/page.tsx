import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { Reveal, MediaReveal } from "@/components/motion/Reveal";
import { HeroSequence } from "@/components/motion/HeroSequence";
import { MaskedWords } from "@/components/motion/MaskedWords";
import { ProductCard } from "@/components/commerce/ProductCard";
import { products } from "@/data/products";
import { waLink, generalEnquiryMessage } from "@/lib/whatsapp";
import Image from "next/image";
import {
  ArrowUpRight,
  Cross,
  House,
  Pill,
  Stethoscope,
  Tractor,
} from "lucide-react";

const featuredProducts = products.slice(0, 4);

/** Animal-care categories — cards linking to their care pages. */
const animalCards = [
  {
    id: "pets-companion",
    title: "Pets & Companion Animals",
    body: "Veterinary consultations, preventive healthcare, and treatment guidance for companion animals.",
    href: "/pet-care",
    cta: "View pet care",
    image: "/images/cat.jpg",
    imageAlt: "A black-and-white cat resting its paws on a bamboo rail",
  },
  {
    id: "livestock-farm",
    title: "Livestock & Farm Animals",
    body: "Veterinary support and practical healthcare guidance for farm animals.",
    href: "/livestock",
    cta: "View livestock care",
    image: "/images/sheep-goats.png",
    imageAlt: "Cattle, goats and poultry feeding together on a farm",
  },
  {
    id: "wildlife-exotic",
    title: "Wildlife & Exotic Animals",
    body: "Veterinary care for wildlife and exotic species, with services arranged according to the animal's needs and available facilities.",
    href: "/wildlife-exotic-animals",
    cta: "View wildlife care",
    image: "/images/wildlife.png",
    imageAlt: "Lions resting in a wooded wildlife enclosure",
  },
];

/** Services shown are limited to those stated on the existing site pages. */
const services = [
  {
    title: "Veterinary consultations",
    body: "Clinical examinations, diagnosis, and treatment planning for animals of all kinds.",
    Icon: Stethoscope,
  },
  {
    title: "Medication and treatment guidance",
    body: "Clear, practical guidance on medication and treatment for animal owners.",
    Icon: Pill,
  },
  {
    title: "Surgical procedures",
    body: "Surgical care planned case by case, according to the animal's condition and available facilities.",
    Icon: Cross,
  },
  {
    title: "Home veterinary visits",
    body: "Veterinary home visits for companion animals across Lahore, by prior arrangement.",
    Icon: House,
  },
  {
    title: "Farm consultations",
    body: "On-farm veterinary consultations with practical healthcare guidance for livestock.",
    Icon: Tractor,
  },
];

export default function Home() {
  return (
    <>
      {/* Hero — art-directed two-column editorial layout. At lg+ the grid is
          fitted to the viewport below the header (72px + 1px rule), leaving a
          consistent 48px peek of the sage section below; Section supplies the
          Container. Height is intentionally uncapped so the peek stays 48px
          rather than ballooning on tall viewports. HeroSequence drives a single
          cinematic entrance timeline via data attributes. */}
      <Section
        surface="ivory"
        spacing="none"
        className="pt-10 md:pt-16 lg:pt-0"
      >
        <HeroSequence>
          <div className="grid items-center gap-8 lg:h-[calc(100svh_-_73px_-_48px)] lg:min-h-[600px] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
            <div>
              <div data-hero-eyebrow>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber sm:text-[12px]">
                  Veterinary Care · Lahore, Pakistan
                </p>
              </div>
              <h1 className="text-display text-balance mt-4 text-[34px] leading-[1.08] tracking-[-0.015em] text-charcoal sm:text-[42px] lg:text-[50px] xl:text-[56px]">
                <MaskedWords text="Every animal deserves a healthier life." />
              </h1>
              <p
                data-hero-body
                className="text-pretty mt-6 max-w-[31rem] text-[16px] leading-[1.65] text-muted sm:text-[17px]"
              >
                Veterinary care for companion animals, livestock, large animals
                and wildlife, with a focus on animal health, responsible
                treatment and practical guidance.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span data-hero-cta>
                  <Button href="#animal-care" size="lg" variant="primary">
                    Explore Animal Care
                  </Button>
                </span>
                <span data-hero-cta>
                  <Button href="/contact" size="lg" variant="secondary">
                    Contact Dr. Ali
                  </Button>
                </span>
              </div>
            </div>

            <div>
              <div
                data-hero-media
                className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage shadow-[0_24px_60px_-32px_rgba(24,61,50,0.4)] sm:aspect-[5/4] lg:aspect-[4/5] lg:max-h-[calc(100svh_-_200px)]"
              >
                <div data-hero-scale className="absolute inset-0">
                  <Image
                    src="/images/hero-vet-dog.png"
                    alt="Veterinarian examining a dog on an examination table"
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 44vw"
                    className="object-cover object-[50%_30%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </HeroSequence>
      </Section>

      {/* Animal care — four consistent category cards on the sage band.
          Hairlines top and bottom frame the band against the ivory hero. */}
      <Section
        id="animal-care"
        surface="sage"
        spacing="tight"
        className="mt-16 scroll-mt-20 border-y border-forest/15 md:mt-24 lg:mt-0"
      >
        <Reveal>
          <h2 className="max-w-xl text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.015em] text-charcoal md:text-[36px]">
            Care for every kind of animal
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:mt-12 lg:grid-cols-3 lg:gap-8">
          {animalCards.map((card, i) => (
            <Reveal key={card.id} staggerIndex={i}>
              <article
                id={card.id}
                className="group flex h-full scroll-mt-24 flex-col overflow-hidden rounded-card border border-border-subtle bg-white transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover focus-within:border-forest/25 focus-within:shadow-card-hover"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-sage">
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-[21px] font-medium leading-[1.25] tracking-[-0.01em] text-forest">
                    {card.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">
                    {card.body}
                  </p>
                  <div className="mt-5 flex border-t border-border-subtle pt-5">
                    <Button
                      href={card.href}
                      size="sm"
                      variant="secondary"
                      className="self-start"
                    >
                      {card.cta}
                      <ArrowUpRight
                        className="h-3.5 w-3.5 shrink-0 transition-transform duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px] group-focus-within:translate-x-[2px]"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Veterinary services — five service cards plus a contact CTA cell */}
      <Section surface="ivory" spacing="default">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
            Services
          </p>
          <h2 className="mt-2 max-w-2xl text-balance text-[30px] font-medium leading-[1.25] tracking-[-0.02em] text-charcoal md:text-[40px]">
            Veterinary services you can rely on
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.title} staggerIndex={i}>
              <article className="flex h-full flex-col rounded-card border border-border-subtle bg-white p-6 transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover sm:p-7">
                <service.Icon
                  className="h-6 w-6 text-forest"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-display text-[21px] font-medium leading-[1.25] text-forest sm:min-h-[53px]">
                  {service.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {service.body}
                </p>
              </article>
            </Reveal>
          ))}
          <Reveal staggerIndex={services.length}>
            <article className="flex h-full flex-col rounded-card bg-forest p-6 text-white transition-[box-shadow,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-card-hover sm:p-7">
              <h3 className="mt-10 font-display text-[21px] font-medium leading-[1.25] text-ivory sm:min-h-[53px]">
                Talk to Dr. Ali
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white/75">
                Have a question about your animal? Get in touch for an
                appointment or an enquiry.
              </p>
              <div className="mt-5">
                <Button
                  href="/contact"
                  size="md"
                  variant="amber"
                  className="self-start"
                >
                  Contact Dr. Ali
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 transition-transform duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px]"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </article>
          </Reveal>
        </div>
      </Section>

      {/* About preview — real portrait with confirmed professional details.
          Coordinated directional reveals: portrait from the left, copy from
          the right. */}
      <Section surface="white" spacing="tight">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal direction="left" className="lg:col-span-6">
            <MediaReveal>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage shadow-[0_24px_60px_-32px_rgba(24,61,50,0.4)] sm:max-w-[440px] lg:max-w-none">
                <Image
                  src="/images/dr-ali-ahmad.png"
                  alt="Portrait of Dr. Ali Ahmad"
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 440px, 40vw"
                  className="object-cover object-top"
                />
              </div>
            </MediaReveal>
          </Reveal>
          <Reveal delay={0.08} direction="right" className="lg:col-span-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              Meet the veterinarian
            </p>
            <h2 className="mt-3 text-balance text-[28px] font-medium leading-[1.25] tracking-[-0.02em] text-charcoal md:text-[36px]">
              Dr. Ali Ahmad
            </h2>
            <p className="mt-2 text-[15px] font-semibold text-forest">
              Doctor of Veterinary Medicine (DVM)
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Dr. Ali Ahmad provides veterinary consultations, home visits
              and farm consultations in Lahore, with a focus on animal health
              and responsible treatment. He is an experienced veterinary
              doctor.
            </p>
            <ul
              aria-label="Credentials"
              className="mt-5 flex flex-wrap items-center gap-2"
            >
              {["DVM", "RVMP", "Experienced Veterinarian"].map(
                (credential) => (
                  <li
                    key={credential}
                    className="inline-flex items-center rounded-control border border-border-subtle bg-ivory px-3 py-1.5 text-[13px] font-medium text-forest"
                  >
                    {credential}
                  </li>
                ),
              )}
            </ul>
            <div className="mt-6">
              <Button href="/about" size="md" variant="primary">
                More about Dr. Ali
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 transition-transform duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px]"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Selected products — hidden until verified inventory is published */}
      {featuredProducts.length > 0 ? (
        <Section surface="ivory" spacing="default">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
                Catalog
              </p>
              <h2 className="mt-2 max-w-lg text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
                Selected products
              </h2>
            </div>
            <Button href="/products" size="md" variant="ghost">
              View all products
            </Button>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => {
              const isUnavailable = product.availability === "unavailable";
              const waLabel = isUnavailable
                ? "Enquire on WhatsApp"
                : "Order on WhatsApp";
              const waMessage = isUnavailable
                ? `Assalam-o-Alaikum, I would like to enquire about ${product.name}. Please share restock availability and the price.`
                : `Assalam-o-Alaikum, I would like to enquire about ordering ${product.name}. Please share the price and availability.`;
              return (
                <Reveal key={product.slug} staggerIndex={i}>
                  <ProductCard
                    compact
                    href={`/products/${product.slug}`}
                    name={product.name}
                    description={product.description}
                    imageSrc={product.image}
                    imageAlt={product.imageAlt}
                    whatsapp={{ href: waLink(waMessage), label: waLabel }}
                    className="h-full"
                  />
                </Reveal>
              );
            })}
          </div>
        </Section>
      ) : null}

      {/* Closing contact CTA — WhatsApp + call, shared band into the footer */}
      <WhatsAppBand
        body="Veterinary home visits and farm consultations across Lahore. Message on WhatsApp or call for appointments and animal-health enquiries."
        whatsappMessage={generalEnquiryMessage}
        callLabel="Call Dr. Ali"
      />
    </>
  );
}
