import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const categoryBlocks = [
  {
    name: "Outerwear",
    copy: "Statement coats and structured silhouettes built for command.",
    href: "/shop?category=Outerwear",
    tone: "from-[#f6d9c0] to-[#f2bf99]"
  },
  {
    name: "Tops",
    copy: "Smart knits and luxury shirts for effortless power dressing.",
    href: "/shop?category=Tops",
    tone: "from-[#c5e5dc] to-[#9fcfbe]"
  },
  {
    name: "Bottoms",
    copy: "Precision tailoring from street taper to runway drape.",
    href: "/shop?category=Bottoms",
    tone: "from-[#dfd8f6] to-[#c5bce3]"
  },
  {
    name: "Accessories",
    copy: "Luxury details that complete every look with intent.",
    href: "/shop?category=Accessories",
    tone: "from-[#f4e3c9] to-[#e9c691]"
  }
];

export function CategoryShowcase() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="By Category"
          title="Build your signature wardrobe."
          subtitle="Select a lane and discover premium pieces crafted to elevate your style identity."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {categoryBlocks.map((block, index) => (
            <Link
              key={block.name}
              href={block.href}
              className={`group relative overflow-hidden rounded-[30px] border border-black/10 bg-gradient-to-br ${block.tone} p-7 shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/30 blur-xl transition group-hover:scale-125" />
              <p className="text-xs uppercase tracking-[0.16em] text-ink/55">Edit</p>
              <h3 className="mt-2 font-display text-4xl text-ink">{block.name}</h3>
              <p className="mt-3 max-w-xs text-sm text-ink/70">{block.copy}</p>
              <span className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                Explore
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
