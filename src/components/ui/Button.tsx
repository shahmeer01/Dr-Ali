import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "amber";
type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, "className" | "children"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-forest text-white hover:bg-[#1f4f41] hover:shadow-card-hover active:bg-[#14332a] active:shadow-none focus-visible:outline-forest",
  secondary:
    "border border-forest/30 bg-transparent text-forest hover:border-forest/60 hover:bg-forest/[0.04] active:bg-forest/[0.08] focus-visible:outline-forest",
  ghost:
    "bg-transparent text-charcoal hover:bg-charcoal/[0.05] active:bg-charcoal/[0.08] focus-visible:outline-charcoal/60",
  amber:
    "bg-amber text-charcoal hover:bg-[#b57a45] active:bg-[#a66d3c] focus-visible:outline-amber",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm gap-1.5",
  md: "h-12 px-5 text-[15px] gap-2",
  lg: "h-14 px-7 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-control font-medium tracking-[0.01em]",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
    "hover:-translate-y-px active:translate-y-0",
    "focus-visible:outline-2 focus-visible:outline-offset-3",
    "disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if (rest.href !== undefined) {
    const { href, ...linkRest } = rest;
    return (
      <a href={href} className={classes} {...linkRest}>
        {children}
      </a>
    );
  }

  const buttonRest = rest as ButtonAsButton;
  return (
    <button type="button" className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
