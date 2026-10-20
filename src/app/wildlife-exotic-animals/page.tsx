import type { Metadata } from "next";
import Image from "next/image";
import {
  Bird,
  ClipboardList,
  Cross,
  PawPrint,
  Phone,
  Pill,
  Snail,
  Stethoscope,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal, MediaReveal } from "@/components/motion/Reveal";
import { HeroSequence } from "@/components/motion/HeroSequence";
import { MaskedWords } from "@/components/motion/MaskedWords";
import { ScrollParallax } from "@/components/motion/ScrollParallax";
import { WhatsAppIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Wildlife & Exotic Animals",
  description:
    "Veterinary care and consultation for wildlife and exotic animals in Lahore, with an approach focused on animal welfare and responsible treatment.",
};

/** Animal groups — described by species group, not a guarantee of every species. */
const careGroups = [
  {
    icon: PawPrint,
    title: "Wild Mammals",
    body: "Veterinary assessment and care guidance for wild mammal species.",
  },
  {
    icon: Bird,
    title: "Birds",
    body: "Healthcare guidance for birds, subject to the doctor's actual expertise and available facilities.",
  },
  {
    icon: Snail,
    title: "Reptiles & Exotic Species",
    body: "Species-appropriate veterinary assessment and care guidance.",
  },
];

/** Services limited to those stated across the existing site. */
const services = [
  {
    icon: Stethoscope,
    title: "Veterinary consultation and assessment",
    body: "Clinical examination and assessment to understand the animal's condition.",
  },
  {
    icon: ClipboardList,
    title: "Health evaluation and treatment guidance",
    body: "Clear evaluation and treatment guidance based on the animal's needs.",
  },
  {
    icon: Pill,
    title: "Medication and follow-up guidance",
    body: "Practical guidance on medication and follow-up care for the animal.",
  },
  {
    icon: Cross,
    title: "Surgical procedures",
    body: "Surgical procedures where appropriate expertise and facilities are available.",
  },
];

export default function WildlifeExoticPage() {
  return (
    <>
      {/* Page-local hero — keeps the shared PageHero untouched for other
          pages. HeroSequence drives a cinematic entrance; the wildlife
          image gets a clip reveal, scale settle, subtle desktop parallax,
          and a restrained hover zoom. */}
      <section className="bg-ivory pb-14 pt-10 md:pb-20 md:pt-16 lg:pb-6 lg:pt-6">
        <Container>
          <HeroSequence>
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-6 xl:col-span-5">
                <div data-hero-eyebrow>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
                    Wildlife &amp; Exotic Animals
                  </p>
                </div>
                <h1 className="mt-4 text-display text-balance text-[32px] text-charcoal sm:text-[40px] lg:text-[40px]">
                  <MaskedWords text="Compassionate care for wildlife and exotic animals." />
                </h1>
                <p
                  data-hero-body
                  className="mt-5 max-w-md text-pretty text-[17px] leading-relaxed text-muted md:text-[18px]"
                >
                  Every species has unique healthcare needs. Explore veterinary
                  care and consultation for wildlife and exotic animals, with
                  an approach focused on animal welfare and responsible
                  treatment.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <span data-hero-cta>
                    <Button href="/contact" size="lg" variant="primary">
                      Contact Dr. Ali
                    </Button>
                  </span>
                  <span data-hero-cta>
                    <Button href="#care" size="lg" variant="secondary">
                      Explore Care
                    </Button>
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6 lg:col-start-7 xl:col-span-7">
                <div data-hero-media className="group">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage shadow-[0_24px_60px_-32px_rgba(24,61,50,0.4)] sm:aspect-[5/4] xl:aspect-[4/3]">
                    <div data-hero-scale className="absolute inset-0">
                      <ScrollParallax
                        className="absolute inset-x-0 -top-[6%] -bottom-[6%]"
                        distance={24}
                      >
                        <Image
                          src="/images/wildlife.png"
                          alt="Lions resting in a wooded wildlife enclosure"
                          fill
                          priority
                          sizes="(max-width: 1023px) 100vw, 48vw"
                          className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                        />
                      </ScrollParallax>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HeroSequence>
        </Container>
      </section>

      {/* Animal care groups */}
      <Section
        id="care"
        surface="white"
        spacing="default"
        className="scroll-mt-20"
      >
        <Reveal>
          <h2 className="max-w-xl text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
            Wildlife and exotic animal care
          </h2>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted">
            Care is arranged around the animal&apos;s species, its condition,
            and the facilities available — described below by animal group.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {careGroups.map((group, i) => (
            <Reveal key={group.title} staggerIndex={i}>
              <article className="flex h-full flex-col rounded-card border border-border-subtle bg-white p-6 transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover sm:p-7">
                <group.icon
                  className="h-6 w-6 text-forest"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-display text-[22px] font-medium text-forest">
                  {group.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {group.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section id="services" surface="ivory" spacing="tight" className="scroll-mt-20">
        <Reveal>
          <h2 className="max-w-xl text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
            Responsible veterinary care
          </h2>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted">
            Consultation, evaluation, and treatment guidance arranged case by
            case, according to the animal and the setting.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <Reveal key={service.title} staggerIndex={i}>
              <article className="flex h-full flex-col rounded-card border border-border-subtle bg-white p-6 transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover sm:p-7">
                <service.icon
                  className="h-6 w-6 text-forest"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-display text-[22px] font-medium text-forest">
                  {service.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {service.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Animal welfare — coordinated directional reveals: heading from the
          left, responsible-care copy from the right */}
      <Section surface="sage" spacing="tight">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal direction="left" className="lg:col-span-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              Animal welfare
            </p>
            <h2 className="mt-3 text-balance text-[28px] font-medium leading-[1.25] tracking-[-0.02em] text-charcoal md:text-[36px]">
              Wildlife care, planned responsibly
            </h2>
          </Reveal>
          <Reveal
            delay={0.08}
            direction="right"
            className="lg:col-span-6 lg:col-start-7"
          >
            <div className="space-y-4 text-[16px] leading-relaxed text-muted md:text-[17px]">
              <p>
                Wildlife and exotic animals often need appropriate facilities,
                trained personnel, and safe handling to be examined and treated
                safely. Some cases also require applicable permissions before
                treatment can proceed.
              </p>
              <p>
                Contact {siteConfig.name} to discuss the species, its
                condition, and the care arrangements that may be appropriate —
                every enquiry is assessed on its own circumstances.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* About the veterinarian — coordinated directional reveals: portrait
          from the left, bio from the right */}
      <Section surface="white" spacing="tight">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal direction="left" className="lg:col-span-5">
            <MediaReveal>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage shadow-[0_24px_60px_-32px_rgba(24,61,50,0.4)] sm:max-w-[400px] lg:max-w-none">
                <Image
                  src="/images/dr-ali-ahmad.png"
                  alt="Portrait of Dr. Ali Ahmad"
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 400px, 36vw"
                  className="object-cover object-top"
                />
              </div>
            </MediaReveal>
          </Reveal>
          <Reveal delay={0.08} direction="right" className="lg:col-span-6 lg:col-start-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              About the veterinarian
            </p>
            <h2 className="mt-3 text-balance text-[28px] font-medium leading-[1.25] tracking-[-0.02em] text-charcoal md:text-[36px]">
              {siteConfig.name}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted md:text-[17px]">
              {siteConfig.name} is a veterinary surgeon based in{" "}
              {siteConfig.location}, with 3 years of experience in animal
              healthcare. Consultations focus on careful examination, plain
              explanations, and responsible treatment — arranged around the
              animal&apos;s needs and the available facilities.
            </p>
            <div className="mt-6">
              <Button href="/about" size="md" variant="secondary">
                More about Dr. Ali
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Contact CTA */}
      <section className="border-t border-border-subtle bg-white py-10 md:py-12 lg:py-14">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.015em] text-charcoal md:text-[36px]">
                Need veterinary guidance for a wildlife or exotic animal?
              </h2>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">
                Contact {siteConfig.name} to discuss the animal, its condition,
                and the appropriate care arrangements.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button href={siteConfig.phoneHref} size="lg" variant="secondary">
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call Now
              </Button>
              <Button
                href={waLink(
                  "Hello Dr. Ali Ahmad, I would like to discuss a wildlife or exotic animal. The animal is:",
                )}
                size="lg"
                variant="primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp Dr. Ali
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
