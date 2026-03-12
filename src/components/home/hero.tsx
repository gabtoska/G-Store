import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function Hero({ spotlight }: { spotlight: Product }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-12 sm:pb-24 sm:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-50" />
      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Pill className="animate-reveal">Runway to Real Life</Pill>
            <h1 className="animate-reveal font-display text-5xl leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
              Dress like a G.
              <br />
              Move like a legend.
            </h1>
            <p className="max-w-xl animate-reveal text-base leading-relaxed text-ink/70 sm:text-lg">
              G Store is a high-end digital fashion house where sharp tailoring, luxe textures, and street confidence
              converge into unforgettable fits.
            </p>
            <div className="flex animate-reveal flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-semibold uppercase tracking-[0.13em] text-cloud shadow-float transition hover:-translate-y-0.5 hover:bg-black"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/shop/${spotlight.slug}`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 bg-white/75 px-7 text-sm font-semibold uppercase tracking-[0.13em] text-ink backdrop-blur transition hover:border-ink"
              >
                View Spotlight
              </Link>
            </div>
            <div className="grid max-w-md grid-cols-3 gap-4 pt-3">
              <div>
                <p className="font-display text-3xl text-ink">150k+</p>
                <p className="text-xs uppercase tracking-[0.14em] text-ink/55">Global customers</p>
              </div>
              <div>
                <p className="font-display text-3xl text-ink">72h</p>
                <p className="text-xs uppercase tracking-[0.14em] text-ink/55">Express delivery</p>
              </div>
              <div>
                <p className="font-display text-3xl text-ink">4.9</p>
                <p className="text-xs uppercase tracking-[0.14em] text-ink/55">Average rating</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-coral/30 blur-2xl" />
            <div className="absolute -bottom-8 right-0 h-36 w-36 rounded-full bg-accent/25 blur-3xl" />
            <div className="relative animate-float overflow-hidden rounded-[38px] border border-black/10 bg-white/80 shadow-float">
              <div className="relative h-[520px]">
                <Image
                  src={spotlight.gallery[0]}
                  alt={spotlight.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-black/35 p-4 text-cloud backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-cloud/75">Spotlight</p>
                  <h3 className="font-display text-2xl">{spotlight.name}</h3>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <p className="inline-flex items-center gap-2 text-cloud/80">
                      <Sparkles className="h-4 w-4 text-brass" />
                      {spotlight.tagline}
                    </p>
                    <p className="font-bold">{formatMoney(spotlight.priceCents)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
