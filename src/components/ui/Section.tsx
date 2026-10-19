import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

type SectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Surface treatment for the section band */
  surface?: "ivory" | "white" | "sage" | "forest";
  /** Vertical rhythm: md = default editorial spacing, tight = reduced */
  spacing?: "default" | "tight" | "none";
  /** Override the spacing ladder entirely (avoids class conflicts with spacing) */
  spacingClassName?: string;
  /** Disable the inner Container when laying out full-bleed media */
  contained?: boolean;
  id?: string;
};

const surfaceStyles: Record<NonNullable<SectionProps["surface"]>, string> = {
  ivory: "bg-ivory",
  white: "bg-white",
  sage: "bg-sage",
  forest: "bg-forest text-white",
};

const spacingStyles: Record<NonNullable<SectionProps["spacing"]>, string> = {
  default: "section-y",
  tight: "section-y-tight",
  none: "py-0",
};

export function Section({
  children,
  className,
  containerClassName,
  surface = "ivory",
  spacing = "default",
  spacingClassName,
  contained = true,
  id,
}: SectionProps) {
  const spacingStyle = spacingClassName ?? spacingStyles[spacing];
  return (
    <section
      id={id}
      className={cn(surfaceStyles[surface], spacingStyle, className)}
    >
      {contained ? (
        <Container className={containerClassName}>{children}</Container>
      ) : (
        children
      )}
    </section>
  );
}
