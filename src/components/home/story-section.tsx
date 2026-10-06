import { ProductImage } from "@/components/ui/product-image";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function StorySection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white/80 p-8 shadow-float sm:p-10">
            <div className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
            <SectionHeading
              eyebrow="Craftsmanship"
              title="Engineered fit, couture finish."
              subtitle="From sourcing to stitching, every G Store piece passes a multi-step precision process to ensure premium touch, shape retention, and runway-grade detail."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-black/10 bg-cloud/80 p-4">
                <p className="font-display text-3xl text-ink">01</p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-ink/55">
                  Material Curation
                </p>
              </article>
              <article className="rounded-2xl border border-black/10 bg-cloud/80 p-4">
                <p className="font-display text-3xl text-ink">02</p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-ink/55">
                  Tailoring Lab
                </p>
              </article>
              <article className="rounded-2xl border border-black/10 bg-cloud/80 p-4">
                <p className="font-display text-3xl text-ink">03</p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-ink/55">
                  Final Inspection
                </p>
              </article>
            </div>
          </div>
          <div className="relative h-[500px] overflow-hidden rounded-[34px] border border-black/10 bg-white/80 shadow-float">
            <ProductImage
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80"
              alt="G Store atelier style imagery"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 max-w-xs font-display text-3xl leading-tight text-cloud">
              Tailored confidence for the global stage.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
