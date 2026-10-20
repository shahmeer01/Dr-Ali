import type { Metadata } from "next";
import Image from "next/image";
import {
  Stethoscope,
  HeartPulse,
  Syringe,
  Scissors,
  Salad,
  Milk,
  ClipboardList,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { HeroSequence } from "@/components/motion/HeroSequence";
import { MaskedWords } from "@/components/motion/MaskedWords";
import { ScrollParallax } from "@/components/motion/ScrollParallax";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Overview of veterinary services for pets and livestock: consultation, checkups, vaccination, grooming, nutrition, and farm consultancy.",
};

const petServices = [
  {
    icon: Stethoscope,
    title: "Consultation & treatment",
    body: "Clinical examination, diagnosis, and treatment planning for dogs, cats, and companion animals.",
    href: "/pet-care",
  },
  {
    icon: Syringe,
    title: "Vaccination & preventive care",
    body: "Core and lifestyle vaccination planning plus routine checkups that catch problems early.",
    href: "/pet-care",
  },
  {
    icon: Scissors,
    title: "Grooming & hygiene",
    body: "Coat, skin, nail, ear, and dental hygiene guidance for regular pet care.",
    href: "/pet-care",
  },
  {
    icon: Salad,
    title: "Pet nutrition",
    body: "Feeding advice on food choice, portions, and life-stage diets.",
    href: "/pet-care",
  },
];

const livestockServices = [
  {
    icon: Milk,
    title: "Cattle & buffalo care",
    body: "Health support and preventive planning for dairy and farm animals.",
    href: "/livestock",
  },
  {
    icon: HeartPulse,
    title: "Sheep & goat care",
    body: "Individual and flock-level healthcare for small ruminants.",
    href: "/livestock",
  },
  {
    icon: Salad,
    title: "Animal nutrition",
    body: "Ration and feeding guidance supporting condition and productivity.",
    href: "/livestock",
  },
  {
    icon: MapPin,
    title: "Farm visits & consultancy",
    body: "On-farm assessment and management advice by prior arrangement.",
    href: "/livestock",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Page-local hero — keeps the shared PageHero untouched for other
          pages. HeroSequence drives a cinematic entrance; the exam image
          gets a clip reveal, scale settle, subtle desktop parallax, and a
          restrained hover zoom. */}
      <section className="bg-ivory pb-14 pt-10 md:pb-20 md:pt-16 lg:pb-24 lg:pt-20">
        <Container>
          <HeroSequence>
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-6 xl:col-span-5">
                <div data-hero-eyebrow>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
                    Services
                  </p>
                </div>
                <h1 className="mt-4 text-display text-balance text-[36px] text-charcoal sm:text-[46px] lg:text-[60px]">
                  <MaskedWords text="Veterinary services overview" />
                </h1>
                <p
                  data-hero-body
                  className="mt-5 max-w-md text-pretty text-[17px] leading-relaxed text-muted md:text-[18px]"
                >
                  Companion animal care and livestock healthcare — explore the
                  full service pages for each.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <span data-hero-cta>
                    <Button
                      href={waLink(
                        "Hello Dr. Ali Ahmad, I would like to ask about your services.",
                      )}
                      size="lg"
                      variant="primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Ask about a service
                    </Button>
                  </span>
                  <span data-hero-cta>
                    <Button href="/pet-care" size="lg" variant="secondary">
                      Pet care services
                    </Button>
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6 lg:col-start-7 xl:col-span-7">
                <div data-hero-media className="group">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage shadow-[0_24px_60px_-32px_rgba(24,61,50,0.4)] sm:aspect-[5/4] lg:aspect-[4/5]">
                    <div data-hero-scale className="absolute inset-0">
                      <ScrollParallax
                        className="absolute inset-x-0 -top-[6%] -bottom-[6%]"
                        distance={24}
                      >
                        <Image
                          src="/images/vet-dog-exam.jpg"
                          alt="Veterinarian examining a dog"
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

      <Section surface="white" spacing="default">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
            Companion animals
          </p>
          <h2 className="mt-3 text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
            Pet care services
          </h2>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted">
            Everyday veterinary care for dogs, cats, and companion animals.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {petServices.map((service, i) => (
            <Reveal key={service.title} staggerIndex={i}>
              <article className="group flex h-full flex-col rounded-card border border-border-subtle bg-white p-6 transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover focus-within:-translate-y-0.5 focus-within:border-forest/25 focus-within:shadow-card-hover sm:p-7">
                <service.icon
                  className="h-6 w-6 text-forest transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[2px] group-focus-within:-translate-y-[2px]"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-display text-[22px] font-medium text-forest">
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-muted">
                  {service.body}
                </p>
                <Button
                  href={service.href}
                  size="sm"
                  variant="secondary"
                  className="mt-5 self-start"
                >
                  Learn more
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section surface="ivory" spacing="default">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
            Farm animals
          </p>
          <h2 className="mt-3 text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
            Livestock services
          </h2>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted">
            Healthcare, nutrition, and consultancy for cattle, buffalo,
            sheep, and goats.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {livestockServices.map((service, i) => (
            <Reveal key={service.title} staggerIndex={i}>
              <article className="group flex h-full flex-col rounded-card border border-border-subtle bg-white p-6 transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover focus-within:-translate-y-0.5 focus-within:border-forest/25 focus-within:shadow-card-hover sm:p-7">
                <service.icon
                  className="h-6 w-6 text-forest transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[2px] group-focus-within:-translate-y-[2px]"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-display text-[22px] font-medium text-forest">
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-muted">
                  {service.body}
                </p>
                <Button
                  href={service.href}
                  size="sm"
                  variant="secondary"
                  className="mt-5 self-start"
                >
                  Learn more
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8">
          <Button href="/livestock" size="md" variant="primary">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Full livestock services
          </Button>
        </Reveal>
      </Section>

      <WhatsAppBand
        title="Not sure which service you need?"
        body="Describe the animal and the concern — the practice will point you in the right direction."
        whatsappMessage="Hello Dr. Ali Ahmad, I am not sure which service I need. My situation:"
      />
    </>
  );
}
