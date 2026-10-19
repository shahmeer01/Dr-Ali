import type { Metadata } from "next";
import Image from "next/image";
import { Clock, GraduationCap, HeartHandshake, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal, MediaReveal } from "@/components/motion/Reveal";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { siteConfig } from "@/config/site";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Dr. Ali Ahmad, veterinary surgeon providing professional care for pets and livestock in Lahore, Pakistan.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Honest recommendations",
    body: "Only the care an animal actually needs — no unnecessary procedures, and clear explanations of every recommendation.",
  },
  {
    icon: HeartHandshake,
    title: "Respect for animals",
    body: "Calm handling and low-stress techniques, whether the patient is a family dog or a dairy buffalo.",
  },
  {
    icon: GraduationCap,
    title: "Practical education",
    body: "Every visit leaves you with clear guidance you can apply at home or on the farm.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Page-local hero — keeps the shared PageHero untouched for other pages */}
      <section className="bg-ivory pb-14 pt-10 md:pb-20 md:pt-16 lg:flex lg:h-[calc(100svh_-_73px)] lg:max-h-[900px] lg:min-h-[560px] lg:flex-col lg:justify-center lg:pb-0 lg:pt-0">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <Reveal immediate delay={0}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
                  About the practice
                </p>
              </Reveal>
              <Reveal immediate delay={0.06}>
                <h1 className="mt-4 text-display text-balance text-[36px] text-charcoal sm:text-[46px] lg:text-[60px]">
                  {siteConfig.name}
                </h1>
              </Reveal>
              <Reveal immediate delay={0.14}>
                <p className="mt-5 max-w-md text-pretty text-[17px] leading-relaxed text-muted md:text-[18px]">
                  Veterinary surgeon in Lahore, caring for companion animals
                  and livestock with careful examinations, plain explanations,
                  and practical guidance.
                </p>
              </Reveal>
              <Reveal immediate delay={0.22}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button href="/contact" size="lg" variant="primary">
                    Get in touch
                  </Button>
                  <Button href="#approach" size="lg" variant="secondary">
                    How the practice works
                  </Button>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <div className="lg:ml-auto lg:max-w-[calc((100svh_-_73px)*0.8)]">
                <MediaReveal delay={0.12}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage shadow-[0_24px_60px_-32px_rgba(24,61,50,0.4)] lg:aspect-[4/5]">
                    <Image
                      src="/images/stethoscope-desk.png"
                      alt="Veterinarian examining a goat at a livestock farm"
                      fill
                      priority
                      sizes="(max-width: 1023px) 100vw, 48vw"
                      className="object-cover"
                    />
                  </div>
                </MediaReveal>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Bio */}
      <Section surface="white" spacing="tight">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-center">
          <Reveal className="lg:col-span-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              Professional background
            </p>
            <h2 className="mt-3 text-balance text-[30px] font-medium leading-[1.25] tracking-[-0.02em] text-charcoal md:text-[40px]">
              Veterinary care with a personal standard
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
            <div className="max-w-[560px] space-y-5 text-[16px] leading-relaxed text-muted md:text-[17px]">
              <p>
                {siteConfig.name} is a veterinary surgeon based in{" "}
                {siteConfig.location}, working with companion animals and
                livestock. The practice is built around careful examination,
                plain explanations, and treatment plans that respect both the
                animal and the owner&apos;s circumstances.
              </p>
              <p>
                Consultations cover everyday pet healthcare — checkups,
                vaccination, grooming, nutrition — as well as livestock
                health, nutrition, and farm-level guidance for cattle,
                buffalo, sheep, and goats.
              </p>
              <p>
                Product listings on this site support the practice&apos;s
                recommendations; availability and pricing are always
                confirmed directly.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section id="approach" surface="ivory" spacing="tight" className="scroll-mt-20">
        <Reveal>
          <h2 className="text-balance text-[30px] font-medium leading-[1.25] tracking-[-0.02em] text-charcoal md:text-[40px]">
            How the practice works
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-10">
          {values.map((value, i) => (
            <Reveal key={value.title} staggerIndex={i}>
              <article className="flex h-full flex-col rounded-card border border-border-subtle bg-white p-6 transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover">
                <value.icon className="h-6 w-6 text-forest" aria-hidden="true" />
                <h3 className="mt-4 font-display text-[22px] font-medium text-forest">
                  {value.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {value.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Meet the veterinarian — portrait + confirmed professional details */}
      <Section surface="white" spacing="tight">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-6">
            <MediaReveal>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage shadow-[0_24px_60px_-32px_rgba(24,61,50,0.4)] sm:max-w-[440px] lg:max-w-none">
                <Image
                  src="/images/dr-ali-ahmad.png"
                  alt="Portrait of Dr. Ali Ahmad"
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 440px, 38vw"
                  className="object-cover object-top"
                />
              </div>
            </MediaReveal>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
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
              Dr. Ali Ahmad is a veterinary practitioner in Lahore with 3
              years of experience in animal healthcare. He provides
              veterinary home visits and farm consultations, with a focus on
              surgical procedures, medication, and compassionate care for
              every animal.
            </p>
            <ul
              aria-label="Credentials"
              className="mt-5 flex flex-wrap items-center gap-2"
            >
              {["DVM", "RVMP", "3 years of veterinary experience"].map(
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
            <div className="mt-5 flex items-start gap-3 rounded-card border border-border-subtle bg-ivory p-4">
              <Clock
                className="mt-0.5 h-5 w-5 shrink-0 text-forest"
                aria-hidden="true"
              />
              <p className="text-[15px] leading-relaxed text-charcoal">
                Veterinary home services available{" "}
                <span className="font-semibold text-forest">24/7</span>{" "}
                across Lahore. Farm consultations are also available.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                href={waLink(
                  "Hello Dr. Ali Ahmad, I would like to book a veterinary visit:",
                )}
                size="md"
                variant="primary"
              >
                Book a Veterinary Visit
              </Button>
              <Button href="/contact" size="md" variant="secondary">
                Contact Dr. Ali
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      <WhatsAppBand
        title="Need veterinary care for your animal?"
        body="Contact Dr. Ali Ahmad for veterinary home visits, farm consultations, and animal healthcare across Lahore."
        whatsappMessage="Hello Dr. Ali Ahmad, I found your website and would like to ask about:"
        callLabel="Call Dr. Ali"
      />
    </>
  );
}
