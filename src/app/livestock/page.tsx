import type { Metadata } from "next";
import Image from "next/image";
import {
  HeartPulse,
  Beef,
  PawPrint,
  Salad,
  ClipboardList,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal, MediaReveal } from "@/components/motion/Reveal";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Livestock",
  description:
    "Cattle, buffalo, sheep, and goat healthcare, nutrition guidance, and livestock consultancy for farmers in Lahore.",
};

const services = [
  {
    icon: Beef,
    title: "Cattle & buffalo healthcare",
    body: "Clinical support for dairy and farm animals — examination, treatment planning, and guidance through common health and production concerns.",
  },
  {
    icon: PawPrint,
    title: "Sheep & goat healthcare",
    body: "Care for small ruminants, from individual animals to flock-level health planning for meat and milk production.",
  },
  {
    icon: HeartPulse,
    title: "Health & preventive care",
    body: "Preventive health programs, vaccination planning, and parasite-control strategies built around your herd or flock.",
  },
  {
    icon: Salad,
    title: "Animal nutrition",
    body: "Ration and feeding guidance to support body condition, productivity, and overall animal health.",
  },
  {
    icon: ClipboardList,
    title: "Livestock consultancy",
    body: "Discussion of herd management, biosecurity, and productivity questions for livestock keepers and farming operations.",
  },
  {
    icon: MapPin,
    title: "Farm visits",
    body: "On-farm assessments available by prior arrangement, subject to confirmed availability and location.",
  },
];

export default function LivestockPage() {
  return (
    <>
      <PageHero
        eyebrow="Livestock"
        title="Practical healthcare for farm animals."
        titleClassName="text-[36px] sm:text-[46px] lg:text-[48px]"
        description="Veterinary support for cattle, buffalo, sheep and goats in Lahore, with practical guidance on animal health and farm care."
        imageSrc="/images/livestock-hero.jpg"
        imageAlt="Herd of buffalo resting on green pasture"
        imageAspect="aspect-[4/5] sm:aspect-[5/4] xl:aspect-[4/3]"
        paddingClassName="pb-14 pt-10 md:pb-20 md:pt-16 lg:pb-6 lg:pt-6"
        actions={
          <>
            <Button
              href={waLink(
                "Hello Dr. Ali Ahmad, I would like to enquire about livestock services. My animals are:",
              )}
              size="lg"
              variant="primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Enquire on WhatsApp
            </Button>
            <Button href="#services" size="lg" variant="secondary">
              View services
            </Button>
          </>
        }
      />

      {/* Introduction */}
      <Section
        surface="white"
        spacingClassName="py-14 md:py-20 lg:pt-8 lg:pb-30"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              For farmers & livestock keepers
            </p>
            <h2 className="mt-3 text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
              Health as the foundation of productivity
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
            <div className="space-y-4 text-[16px] leading-relaxed text-muted md:text-[17px]">
              <p>
                Healthy animals are productive animals. Good nutrition,
                sensible preventive care, and timely treatment protect both
                welfare and the economics of a farming operation — and the
                best time to act is before a problem spreads through the
                herd.
              </p>
              <p>
                Consultations cover individual sick animals as well as
                herd-level questions, with advice written in practical terms
                you can apply on the farm.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Services */}
      <Section id="services" surface="ivory" spacing="default" className="scroll-mt-20">
        <Reveal>
          <h2 className="max-w-xl text-[30px] font-medium tracking-[-0.02em] text-charcoal md:text-[40px]">
            Livestock services
          </h2>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted">
            Healthcare, nutrition, and consultancy for cattle, buffalo,
            sheep, goats, and other farmed animals.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.title} staggerIndex={i}>
              <article className="flex h-full flex-col rounded-card border border-border-subtle bg-white p-6 transition-[box-shadow] duration-[280ms] hover:shadow-card">
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

        <Reveal className="mt-8 rounded-card border border-amber/30 bg-amber/[0.06] p-6">
          <p className="text-[15px] leading-relaxed text-charcoal/85">
            <span className="font-semibold">Farm visits</span> are scheduled
            case by case and are subject to confirmed availability, location,
            and workload. Mention your animals and location when you enquire.
          </p>
        </Reveal>
      </Section>

      {/* Editorial split */}
      <Section surface="white" spacing="default">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              Herd health
            </p>
            <h2 className="mt-3 text-[28px] font-medium tracking-[-0.02em] text-charcoal md:text-[36px]">
              Preventive plans that fit your operation
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                "Vaccination and deworming schedules built around your herd",
                "Nutrition and body-condition guidance for production stages",
                "Biosecurity advice to reduce disease introduction and spread",
                "Clear treatment plans for individual animals",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15.5px] leading-relaxed text-charcoal/85"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
            <MediaReveal>
              <div className="relative aspect-[5/4] w-full overflow-hidden bg-sage">
                <Image
                  src="/images/cattle-feed.jpg"
                  alt="Cattle feeding at a pen on a working farm"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </MediaReveal>
          </Reveal>
        </div>
      </Section>

      <WhatsAppBand
        title="Enquire about farm services"
        body="Share your animal species, herd size, and location — availability for visits will be confirmed on chat."
        whatsappMessage="Hello Dr. Ali Ahmad, I would like to enquire about livestock services. My location and animals:"
      />
    </>
  );
}
