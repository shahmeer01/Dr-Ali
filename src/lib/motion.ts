import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionTokens } from "@/lib/tokens";

let registered = false;

/**
 * Register GSAP plugins once on the client.
 * Safe to call from multiple components.
 */
export function registerGsap(): void {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export const EASE = motionTokens.ease;
export const DURATION = motionTokens.duration;
export const RISE_Y = motionTokens.riseY;
export const STAGGER = motionTokens.stagger;
