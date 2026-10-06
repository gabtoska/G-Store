"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "solid" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  solid:
    "bg-ink text-cloud shadow-float transition hover:-translate-y-0.5 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
  ghost:
    "bg-transparent text-ink transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
  outline:
    "border border-black/20 bg-white/70 text-ink backdrop-blur transition hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 rounded-full px-4 text-xs",
  md: "h-11 rounded-full px-6 text-sm",
  lg: "h-12 rounded-full px-7 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "solid", size = "md", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-semibold uppercase tracking-[0.13em] disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);
