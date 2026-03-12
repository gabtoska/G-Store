"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 12,
  className
}: QuantityStepperProps) {
  return (
    <div className={cn("inline-flex items-center rounded-full border border-black/10 bg-white/75 p-1", className)}>
      <button
        type="button"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-8 text-center text-xs font-semibold">{value}</span>
      <button
        type="button"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
