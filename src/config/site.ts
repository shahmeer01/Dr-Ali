export const siteConfig = {
  name: "Dr. Ali Ahmad",
  role: "Veterinary Surgeon",
  tagline: "Veterinary Care & Animal Health",
  location: "Lahore, Pakistan",
  description:
    "Professional veterinary services for pets and livestock in Lahore, Pakistan, with a curated catalog of animal-care products.",
  // Bump yearly; static year keeps prerender stable.
  copyrightYear: 2026,
  phoneDisplay: "+92 317 6253516",
  phoneHref: "tel:+923176253516",
  whatsappNumber: "923176253516",
  whatsappUrl: "https://wa.me/923176253516",
  nav: [
    { label: "Home", href: "/" },
    { label: "Animal Care", href: "/#animal-care" },
    { label: "Services", href: "/services" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
