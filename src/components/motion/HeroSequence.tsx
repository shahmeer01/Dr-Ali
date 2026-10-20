"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

type HeroSequenceProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Cinematic hero entrance. Orchestrates a single GSAP timeline that
 * targets descendants via data attributes so the server markup stays
 * fully visible until hydration (gsap.from applies from-states).
 *
 * Expected descendants:
 * - [data-hero-eyebrow]   — eyebrow label
 * - [data-hero-word]      — word inners from <MaskedWords />
 * - [data-hero-body]      — supporting paragraph
 * - [data-hero-cta]       — one wrapper per CTA
 * - [data-hero-extra]     — optional trailing detail (e.g. trust points)
 * - [data-hero-media]     — media shell (clip-path reveal)
 * - [data-hero-scale]     — optional inner media layer (scale settle)
 *
 * Uses gsap.matchMedia() for responsive tuning and reverts cleanly
 * on unmount. Respects prefers-reduced-motion by skipping all motion.
 */
export function HeroSequence({ children, className }: HeroSequenceProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: "(max-width: 767px)",
        isDesktop: "(min-width: 768px)",
        noReduce: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isMobile, noReduce } = context.conditions as {
          isMobile: boolean;
          noReduce: boolean;
        };
        if (!noReduce) return;

        const words = el.querySelectorAll<HTMLElement>("[data-hero-word]");
        const ctas = el.querySelectorAll<HTMLElement>("[data-hero-cta]");
        const extras = el.querySelectorAll<HTMLElement>("[data-hero-extra]");
        const eyebrow = el.querySelectorAll("[data-hero-eyebrow]");
        const body = el.querySelectorAll("[data-hero-body]");
        const media = el.querySelector<HTMLElement>("[data-hero-media]");
        const scaleLayer = el.querySelector<HTMLElement>("[data-hero-scale]");

        const yBase = isMobile ? 12 : 18;
        const wordStagger = isMobile ? 0.04 : 0.05;
        const ctaStagger = isMobile ? 0.06 : 0.07;

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        tl.from(eyebrow, {
          opacity: 0,
          y: isMobile ? 10 : 14,
          duration: 0.55,
        }, 0);

        if (words.length) {
          tl.from(words, {
            yPercent: 125,
            duration: isMobile ? 0.7 : 0.8,
            stagger: wordStagger,
          }, 0.08);
        }

        tl.from(body, {
          opacity: 0,
          y: yBase,
          duration: 0.7,
        }, 0.42);

        if (ctas.length) {
          tl.from(ctas, {
            opacity: 0,
            y: isMobile ? 10 : 14,
            duration: 0.6,
            stagger: ctaStagger,
          }, 0.58);
        }

        if (extras.length) {
          tl.from(extras, {
            opacity: 0,
            y: isMobile ? 8 : 12,
            duration: 0.55,
            stagger: 0.06,
          }, 0.72);
        }

        if (media) {
          tl.fromTo(
            media,
            {
              clipPath: "inset(7% 7% 7% 7% round 20px)",
            },
            {
              clipPath: "inset(0% 0% 0% 0% round 20px)",
              duration: 1.15,
              ease: "power3.out",
            },
            0.15,
          );
        }

        if (scaleLayer) {
          tl.fromTo(
            scaleLayer,
            { scale: 1.045 },
            { scale: 1, duration: 1.3, ease: "power3.out" },
            0.15,
          );
        }

        return () => {
          tl.kill();
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
