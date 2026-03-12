import { Container } from "@/components/ui/container";

const testimonials = [
  {
    quote: "The fit quality is absurdly good. Every piece feels bespoke.",
    author: "Arianna K.",
    city: "Milan"
  },
  {
    quote: "Fast delivery, luxury packaging, and runway-level style.",
    author: "Devon R.",
    city: "Los Angeles"
  },
  {
    quote: "G Store became my go-to for statement looks that still feel wearable.",
    author: "Nina C.",
    city: "London"
  }
];

export function TestimonialStrip() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.author}
              className="rounded-[28px] border border-black/10 bg-white/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
            >
              <p className="font-display text-2xl leading-snug text-ink">"{testimonial.quote}"</p>
              <p className="mt-6 text-xs uppercase tracking-[0.15em] text-ink/60">
                {testimonial.author} / {testimonial.city}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
