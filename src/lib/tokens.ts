export const colors = {
  forest: "#183D32",
  ivory: "#F7F5EF",
  sage: "#D5E3D5",
  amber: "#C58A52",
  charcoal: "#262B28",
  surface: "#FFFFFF",
  border: "#E5E2D9",
  muted: "#626B64",
} as const;

export const typography = {
  sans: "DM Sans",
  display: "Playfair Display",
} as const;

export const layout = {
  containerMax: 1280,
  sectionYDesktop: "88–120px",
  sectionYMobile: "56–72px",
  bodySize: "16–18px",
  navSize: "14–15px",
  sectionHeadingDesktop: "36–52px",
  heroHeadingDesktop: "60–80px",
} as const;

export const radius = {
  control: "10px",
  card: "12px",
  editorialMedia: "0px",
} as const;

export const motionTokens = {
  /** Typical entrance duration range from the design spec */
  duration: { fast: 0.5, base: 0.7, media: 0.9 },
  /** Vertical rise for section entrances (spec: 16–24px) */
  riseY: 20,
  stagger: 0.08,
  ease: "power2.out",
} as const;
