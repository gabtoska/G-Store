import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-black/10 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/70 backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}
