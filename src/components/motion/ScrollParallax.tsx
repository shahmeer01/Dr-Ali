"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

type ScrollParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Total parallax travel in px across the scroll range */
  distance?: number;
};

/**
 * Subtle scroll-linked parallax for hero or editorial media.
 *
 * Applies a scrubbed vertical offset to its children as the nearest
 * section scrolls through the viewport. Only active on desktop
 * pointer devices with no reduced-motion preference; the element
 * stays completely static otherwise.
 *
 * The wrapper is typically positioned with slight vertical overflow
 * (e.g. `-top-[6%] -bottom-[6%]`) inside an overflow-hidden shell so
 * the travel never reveals empty edges.
 */
export function ScrollParallax({
  children,
  className,
  distance = 28,
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(hover: none)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const tween = gsap.fromTo(
          el,
          { y: -distance / 2 },
          {
            y: distance / 2,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          },
        );

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, [distance]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
