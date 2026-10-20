"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { DURATION, RISE_Y, prefersReducedMotion } from "@/lib/motion";

const EASE_OUT = "power3.out";

type RevealDirection = "up" | "left" | "right";

const directionFrom: Record<RevealDirection, { x?: number; y?: number }> = {
  up: { y: RISE_Y },
  left: { x: -28 },
  right: { x: 28 },
};

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Vertical rise in px (spec: 16–24) */
  y?: number;
  duration?: number;
  delay?: number;
  /** Directional entrance offset */
  direction?: RevealDirection;
  /** Animate on mount instead of on scroll (hero entrance) */
  immediate?: boolean;
  /** Stagger delay index for grids */
  staggerIndex?: number;
};

/**
 * Once-only fade reveal. Content is visible by default; GSAP only
 * animates when motion is allowed. Reduced motion and no-JS both
 * leave content fully accessible.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  y = RISE_Y,
  duration = DURATION.base,
  delay = 0,
  direction = "up",
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
      const offset = direction === "up" ? { y } : directionFrom[direction];
      const fromVars = {
        opacity: 0,
        ...offset,
        duration,
        ease: EASE_OUT,
        delay: delay + (staggerIndex != null ? staggerIndex * 0.07 : 0),
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
  }, [y, duration, delay, direction, immediate, staggerIndex]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

/**
 * Media reveal — clipped-mask opening with a gentle scale settle.
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
        clipPath: "inset(5% 5% 5% 5%)",
        scale: 1.035,
        duration,
        delay,
        ease: EASE_OUT,
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
    <div
      ref={ref}
      className={cn("will-change-[opacity,clip-path,transform]", className)}
    >
      {children}
    </div>
  );
}
