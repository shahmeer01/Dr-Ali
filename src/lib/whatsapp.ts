import { siteConfig } from "@/config/site";

/** General enquiry copy for the site-wide WhatsApp entry points (CTA + footer). */
export const generalEnquiryMessage =
  "Assalam-o-Alaikum, I would like to enquire about appointments and animal-health products.";

/** Build a wa.me link with an optional prefilled message. */
export function waLink(message?: string): string {
  if (!message) return siteConfig.whatsappUrl;
  return `${siteConfig.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
