import type { Metadata } from "next";
import { Phone, MapPin, Clock } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Dr. Ali Ahmad, veterinary surgeon in Lahore. Call or message on WhatsApp for appointments and product enquiries.",
};

export default function ContactPage() {
  return (
    <>
      <div className="bg-ivory">
        <Container>
          <div className="pb-8 pt-8 md:pt-10">
            <Reveal immediate delay={0}>
              <h1 className="text-display text-balance text-[36px] text-charcoal sm:text-[46px] lg:text-[54px]">
                Get in touch
              </h1>
            </Reveal>
            <Reveal immediate delay={0.06}>
              <p className="mt-4 max-w-xl text-pretty text-[17px] leading-relaxed text-muted">
                Call or message the practice for appointments, livestock
                enquiries, and product questions. Replies come during practice
                hours.
              </p>
            </Reveal>
          </div>
        </Container>
      </div>

      <Section surface="white" spacing="tight">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Call card + form */}
          <div className="lg:col-span-7">
            <Reveal>
              <article className="group flex flex-col gap-4 rounded-card border border-border-subtle bg-white p-6 transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover focus-within:-translate-y-0.5 focus-within:border-forest/25 focus-within:shadow-card-hover sm:flex-row sm:items-center sm:gap-5">
                <Phone
                  className="h-6 w-6 shrink-0 text-forest"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <h2 className="font-display text-[19px] font-medium leading-[1.25] tracking-[-0.01em] text-forest">
                    Call the practice
                  </h2>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">
                    {siteConfig.phoneDisplay}
                  </p>
                </div>
                <Button
                  href={siteConfig.phoneHref}
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Call now
                </Button>
              </article>
            </Reveal>

            <Reveal delay={0.08} className="mt-8">
              <ContactForm />
            </Reveal>
          </div>

          {/* Practical info */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={0.12}>
              <aside className="rounded-card border border-border-subtle bg-ivory p-6 md:p-8">
                <h2 className="font-display text-[22px] font-medium leading-[1.25] tracking-[-0.01em] text-charcoal">
                  Practice information
                </h2>

                <div className="mt-6 space-y-6">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="mt-0.5 h-5 w-5 shrink-0 text-forest"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-[14px] font-semibold text-charcoal">
                        Location
                      </p>
                      <p className="mt-1 text-[15px] leading-relaxed text-muted">
                        {siteConfig.location}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">
                        Clinic address and map link will be added once
                        confirmed by the practice.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock
                      className="mt-0.5 h-5 w-5 shrink-0 text-forest"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-[14px] font-semibold text-charcoal">
                        Hours
                      </p>
                      <p className="mt-1 text-[15px] leading-relaxed text-muted">
                        24/7 home service is available across Lahore. Please
                        call to confirm availability and arrange your visit.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone
                      className="mt-0.5 h-5 w-5 shrink-0 text-forest"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-[14px] font-semibold text-charcoal">
                        Phone
                      </p>
                      <a
                        href={siteConfig.phoneHref}
                        className="mt-1 block text-[17px] font-medium text-forest transition-opacity hover:opacity-80"
                      >
                        {siteConfig.phoneDisplay}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-border-subtle pt-6">
                  <p className="text-[13px] leading-relaxed text-muted">
                    For emergencies, please call{" "}
                    <a
                      href={siteConfig.phoneHref}
                      className="font-medium text-forest underline-offset-4 transition-colors duration-[180ms] hover:text-[#1f4f41] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                    >
                      {siteConfig.phoneDisplay}
                    </a>{" "}
                    directly. WhatsApp messages are not monitored
                    continuously, so please do not rely on WhatsApp for
                    urgent matters.
                  </p>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
