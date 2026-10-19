"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { DURATION, EASE, RISE_Y, prefersReducedMotion } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Vertical rise in px (spec: 16–24) */
  y?: number;
  duration?: number;
  delay?: number;
  /** Animate on mount instead of on scroll (hero entrance) */
  immediate?: boolean;
  /** Stagger delay index for grids */
  staggerIndex?: number;
};

/**
 * Once-only fade-up reveal. Content is visible by default;
 * GSAP only animates when motion is allowed. Reduced motion and
 * no-JS both leave content fully accessible.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  y = RISE_Y,
  duration = DURATION.base,
  delay = 0,
  immediate = false,
  staggerIndex,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const fromVars = {
        opacity: 0,
        y,
        duration,
        ease: EASE,
        delay: delay + (staggerIndex != null ? staggerIndex * 0.06 : 0),
        overwrite: "auto" as const,
      };

      if (immediate) {
        gsap.from(el, fromVars);
      } else {
        gsap.from(el, {
          ...fromVars,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      }
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [y, duration, delay, immediate, staggerIndex]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

/**
 * Subtle media reveal — opacity + gentle clip-path opening.
 * Never leaves media permanently hidden.
 */
export function MediaReveal({
  children,
  className,
  duration = DURATION.media,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        clipPath: "inset(4% 4% 4% 4%)",
        duration,
        delay,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
      });
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [duration, delay]);

  return (
    <div ref={ref} className={cn("will-change-[opacity,clip-path]", className)}>
      {children}
    </div>
  );
}
