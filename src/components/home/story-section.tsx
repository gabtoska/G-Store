import { Container } from "@/components/ui/container";

const steps = [
  {
    number: "01",
    title: "Build a cart",
    copy: "Selected variants and quantities stay on this device between visits.",
  },
  {
    number: "02",
    title: "Review on the server",
    copy: "Checkout reloads each product to verify its price, options, and stock.",
  },
  {
    number: "03",
    title: "Save the order",
    copy: "The completed demo order appears in the signed-in account with its status.",
  },
];

export function StorySection() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="relative overflow-hidden rounded-[36px] bg-ink px-7 py-10 text-cloud shadow-float sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute inset-0 bg-mesh opacity-25" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full border border-white/10" />
          <div className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
                What happens at checkout
              </p>
              <h2 className="mt-4 max-w-lg font-display text-4xl leading-tight sm:text-5xl">
                Three steps from cart to saved order.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-cloud/65 sm:text-base">
                Payment is simulated, while the product validation and order
                record use the same server and database as the rest of the
                store.
              </p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="grid gap-3 py-6 sm:grid-cols-[4rem_1fr] sm:gap-5"
                >
                  <p className="font-display text-3xl text-brass">
                    {step.number}
                  </p>
                  <div>
                    <h3 className="font-display text-2xl">{step.title}</h3>
                    <p className="mt-1 max-w-lg text-sm leading-relaxed text-cloud/60">
                      {step.copy}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
