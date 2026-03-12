import Link from "next/link";

import { Container } from "@/components/ui/container";

export default function NotFoundPage() {
  return (
    <div className="py-20 sm:py-28">
      <Container>
        <div className="rounded-[34px] border border-black/10 bg-white/80 p-10 text-center shadow-float">
          <p className="text-xs uppercase tracking-[0.15em] text-ink/60">404</p>
          <h1 className="mt-2 font-display text-5xl text-ink">Page not found</h1>
          <p className="mt-4 text-sm text-ink/70">The style piece you are looking for does not exist in this edit.</p>
          <Link
            href="/shop"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold uppercase tracking-[0.13em] text-cloud transition hover:-translate-y-0.5 hover:bg-black"
          >
            Return To Shop
          </Link>
        </div>
      </Container>
    </div>
  );
}
