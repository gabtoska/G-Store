import Link from "next/link";

import { Container } from "@/components/ui/container";

const shopLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?collection=Runway", label: "Runway" },
  { href: "/shop?collection=Street", label: "Street" },
  { href: "/shop?collection=Resort", label: "Resort" },
];

const accountLinks = [
  { href: "/cart", label: "Cart" },
  { href: "/account", label: "Account & Orders" },
  { href: "/login", label: "Sign In" },
  { href: "/register", label: "Create Account" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-0 overflow-hidden border-t border-black/10 bg-ink text-cloud">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-40" />
      <Container className="relative">
        <div className="grid gap-12 py-16 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.17em] text-cloud/60">
              G Store
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Build a look from
              <br /> the current catalog.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-cloud/75">
              Browse clothing, footwear, and accessories. Add the pieces you
              want to your cart and complete a demo checkout.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.17em] text-cloud/60">
                Shop
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {shopLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition hover:text-brass"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.17em] text-cloud/60">
                Your account
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {accountLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition hover:text-brass"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/15 py-5 text-xs uppercase tracking-[0.15em] text-cloud/60">
          {new Date().getFullYear()} G Store — portfolio demo. No real payments
          or shipments.
        </div>
      </Container>
    </footer>
  );
}
