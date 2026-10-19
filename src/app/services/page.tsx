import type { Metadata } from "next";
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
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
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
      <PageHero
        eyebrow="Services"
        title="Veterinary services overview"
        description="Companion animal care and livestock healthcare — explore the full service pages for each."
        imageSrc="/images/vet-dog-exam.jpg"
        imageAlt="Veterinarian examining a dog"
        actions={
          <>
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
            <Button href="/pet-care" size="lg" variant="secondary">
              Pet care services
            </Button>
          </>
        }
      />

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
              <article className="flex h-full flex-col rounded-card border border-border-subtle bg-white p-6">
                <service.icon className="h-6 w-6 text-forest" aria-hidden="true" />
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
              <article className="flex h-full flex-col rounded-card border border-border-subtle bg-white p-6">
                <service.icon className="h-6 w-6 text-forest" aria-hidden="true" />
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
