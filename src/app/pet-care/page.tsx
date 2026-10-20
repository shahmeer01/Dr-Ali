import type { Metadata } from "next";
import Image from "next/image";
import {
  Stethoscope,
  ClipboardCheck,
  Syringe,
  Scissors,
  Salad,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Reveal, MediaReveal } from "@/components/motion/Reveal";
import { HeroSequence } from "@/components/motion/HeroSequence";
import { MaskedWords } from "@/components/motion/MaskedWords";
import { ScrollParallax } from "@/components/motion/ScrollParallax";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Pet Care",
  description:
    "Veterinary consultation, checkups, vaccination, grooming, and nutrition guidance for dogs and cats in Lahore.",
};

const services = [
  {
    icon: Stethoscope,
    title: "Consultation & treatment",
    body: "Clinical consultation for dogs, cats, and other companion animals — examination, diagnosis, and a clear treatment plan explained in plain language.",
  },
  {
    icon: ClipboardCheck,
    title: "Checkups & preventive care",
    body: "Routine health checks that catch small problems early, with preventive guidance tailored to your animal's age and lifestyle.",
  },
  {
    icon: Syringe,
    title: "Vaccination",
    body: "Core and lifestyle vaccination planning for puppies, kittens, and adult pets, scheduled around your animal's needs.",
  },
  {
    icon: Scissors,
    title: "Grooming & hygiene",
    body: "Coat, skin, nail, ear, and dental hygiene guidance — plus grooming recommendations suited to your pet's breed and condition.",
  },
  {
    icon: Salad,
    title: "Nutrition guidance",
    body: "Practical feeding advice: choosing the right food, portion control, life-stage diets, and safe treat guidelines.",
  },
];

const trustPoints = [
  "Preventive Care",
  "Practical Guidance",
  "Pet Wellness",
];

export default function PetCarePage() {
  return (
    <>
      {/* Hero — cinematic entrance via HeroSequence */}
      <section className="bg-ivory py-8 md:py-10 lg:flex lg:h-[calc(100svh_-_73px)] lg:min-h-[560px] lg:max-h-[900px] lg:flex-col lg:justify-center lg:py-0">
        <Container>
          <HeroSequence>
            <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-6">
                <div data-hero-eyebrow>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
                    Pet care
                  </p>
                </div>
                <h1 className="text-display text-balance mt-4 text-[34px] text-charcoal sm:text-[42px] xl:text-[54px]">
                  <MaskedWords text="Gentle care. Healthier, happier pets." />
                </h1>
                <p
                  data-hero-body
                  className="mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-muted md:text-[18px]"
                >
                  From preventive care and routine vaccinations to common
                  health concerns, get thoughtful veterinary guidance for
                  your dog or cat in Lahore.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <span data-hero-cta>
                    <Button
                      href={waLink(
                        "Hello Dr. Ali Ahmad, I would like to book a pet care consultation.",
                      )}
                      size="lg"
                      variant="primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Book on WhatsApp
                    </Button>
                  </span>
                  <span data-hero-cta>
                    <Button href="#services" size="lg" variant="secondary">
                      Explore services
                    </Button>
                  </span>
                </div>
                <div data-hero-extra>
                  <ul className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] font-medium leading-5 tracking-[0.01em] text-muted">
                    {trustPoints.map((point, i) => (
                      <li key={point} className="flex items-center gap-3">
                        {i > 0 ? (
                          <span
                            className="h-1 w-1 shrink-0 rounded-full bg-amber/70"
                            aria-hidden="true"
                          />
                        ) : null}
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-6 lg:col-start-7 xl:col-span-5 xl:col-start-8">
                <div data-hero-media className="group">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage shadow-[0_24px_60px_-32px_rgba(24,61,50,0.4)] sm:aspect-[5/4] lg:aspect-[4/5] lg:ml-auto lg:max-w-[calc((100svh_-_89px)*0.8)]">
                    <div data-hero-scale className="absolute inset-0">
                      <ScrollParallax
                        className="absolute inset-x-0 -top-[6%] -bottom-[6%]"
                        distance={24}
                      >
                        <Image
                          src="/images/hero-vet-dog.png"
                          alt="Veterinarian examining a dog on an examination table"
                          fill
                          priority
                          sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 44vw, 34vw"
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

      {/* Introduction — coordinated directional scroll reveals */}
      <Section
        surface="sage"
        spacing="tight"
        className="border-y border-forest/15"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <Reveal direction="left" className="lg:col-span-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              Pet healthcare
            </p>
            <h2 className="text-balance mt-3 font-display text-[28px] font-medium leading-[1.2] tracking-[-0.015em] text-charcoal md:text-[36px]">
              Prevention first, treatment when it matters
            </h2>
          </Reveal>
          <Reveal
            delay={0.08}
            direction="right"
            className="lg:col-span-6 lg:col-start-7"
          >
            <div className="space-y-4 text-[16px] leading-relaxed text-charcoal/75 md:text-[17px]">
              <p>
                Good pet healthcare starts with noticing change early. Regular
                checkups, timely vaccination, sensible nutrition, and good
                hygiene prevent many problems later — and when something is
                wrong, an early visit makes treatment simpler.
              </p>
              <p>
                Every consultation starts with a proper examination and an
                honest conversation about what your animal needs — no
                unnecessary procedures, no jargon.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Services */}
      <Section id="services" surface="ivory" spacing="tight" className="scroll-mt-20">
        <Reveal>
            <h2 className="text-balance max-w-xl font-display text-[28px] font-medium leading-[1.2] tracking-[-0.015em] text-charcoal md:text-[36px]">
            Pet services
          </h2>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted">
            A complete range of everyday veterinary services for companion
            animals.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:mt-12 lg:grid-cols-6">
          {services.map((service, i) => (
            <Reveal
              key={service.title}
              staggerIndex={i}
              className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}
            >
              <article className="group flex h-full flex-col rounded-card border border-border-subtle bg-white p-6 transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover focus-within:-translate-y-0.5 focus-within:border-forest/25 focus-within:shadow-card-hover sm:p-8">
                <service.icon
                  className="h-6 w-6 text-forest transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[2px] group-focus-within:-translate-y-[2px]"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-display text-[22px] font-medium leading-[1.25] tracking-[-0.01em] text-forest">
                  {service.title}
                </h3>
                <p className="mt-3 max-w-[46ch] flex-1 text-[15px] leading-relaxed text-muted">
                  {service.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Editorial split: grooming + nutrition detail — coordinated
          directional reveals: image from the left, copy from the right */}
      <Section surface="ivory" spacing="default" className="border-b border-forest/15">
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal direction="left" className="lg:col-span-6">
            <MediaReveal>
              <div className="relative aspect-[5/4] w-full overflow-hidden bg-sage">
                <Image
                  src="/images/vet-dog-exam.jpg"
                  alt="Veterinarian checking a dog during a clinical examination"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </MediaReveal>
          </Reveal>
          <Reveal delay={0.08} direction="right" className="lg:col-span-5 lg:col-start-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              What to expect
            </p>
            <h2 className="text-balance mt-3 max-w-[340px] font-display text-[28px] font-medium leading-[1.2] tracking-[-0.015em] text-charcoal md:text-[36px]">
              A calm, unrushed consultation
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                "Full physical examination before any recommendation",
                "Clear explanation of findings and next steps",
                "Written guidance on medication, diet, and home care",
                "Follow-up plans for ongoing conditions",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-charcoal/85"
                >
                  <span
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* Related services */}
      <Section surface="sage" spacing="tight">
          <Reveal>
            <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.015em] text-charcoal md:text-[36px]">
              Related services
            </h2>
          </Reveal>
        <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-3">
          {[
            {
              title: "Livestock care",
              body: "Health programs and consultancy for cattle, buffalo, sheep, and goats.",
              href: "/livestock",
              cta: "View livestock services",
            },
            {
              title: "Products",
              body: "Pet food, grooming supplies, accessories, and healthcare products.",
              href: "/products",
              cta: "Browse products",
            },
            {
              title: "Contact",
              body: "Questions before booking? Reach the practice directly.",
              href: "/contact",
              cta: "Get in touch",
            },
          ].map((item, i) => (
            <Reveal key={item.title} staggerIndex={i}>
              <article className="group flex h-full flex-col rounded-card border border-forest/10 bg-white p-6 transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover focus-within:-translate-y-0.5 focus-within:border-forest/25 focus-within:shadow-card-hover">
                <h3 className="font-display text-[22px] font-medium leading-[1.25] tracking-[-0.01em] text-forest">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">
                  {item.body}
                </p>
                <Button
                  href={item.href}
                  size="sm"
                  variant="secondary"
                  className="mt-5 self-start"
                >
                  {item.cta}
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <WhatsAppBand
        title="Book a pet consultation"
        body="Send a message with your pet's species, age, and concern — the practice will respond with available timings."
        whatsappMessage="Hello Dr. Ali Ahmad, I would like to book a pet consultation. My pet is:"
      />
    </>
  );
}
