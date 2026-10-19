import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/config/site";
import { waLink } from "@/lib/whatsapp";

type WhatsAppBandProps = {
  title?: string;
  body?: string;
  message?: string;
  /** Prefilled WhatsApp message for this context */
  whatsappMessage?: string;
  /** Label for the telephone button (e.g. "Call Dr. Ali"). */
  callLabel?: string;
};

/**
 * Shared WhatsApp + call-to-contact band used at the end of service pages.
 */
export function WhatsAppBand({
  title = "Questions about an animal?",
  body = "Reach the practice on WhatsApp for appointments and product enquiries.",
  whatsappMessage,
  callLabel = "Call",
}: WhatsAppBandProps) {
  return (
    <section className="border-t border-border-subtle bg-white py-10 md:py-12 lg:py-14">
      <Container>
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.015em] text-charcoal md:text-[36px]">
              {title}
            </h2>
            <p className="mt-2 text-[16px] leading-relaxed text-muted">{body}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              href={waLink(whatsappMessage)}
              size="lg"
              variant="primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Chat on WhatsApp
            </Button>
            <Button href={siteConfig.phoneHref} size="lg" variant="secondary">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {callLabel}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
