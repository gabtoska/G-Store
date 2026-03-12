import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center", className)}>
      <Pill>{eyebrow}</Pill>
      <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{title}</h2>
      {subtitle ? <p className="max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">{subtitle}</p> : null}
    </div>
  );
}
