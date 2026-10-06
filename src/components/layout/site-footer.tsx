import Link from "next/link";

import { Container } from "@/components/ui/container";

const footerLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?collection=Runway", label: "Runway" },
  { href: "/shop?collection=Street", label: "Street" },
  { href: "/account", label: "Account & Orders" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-black/10 bg-ink text-cloud">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-40" />
      <Container className="relative">
        <div className="grid gap-12 py-16 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.17em] text-cloud/60">
              G Store
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Dress like a G.
              <br />
              Own every room.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-cloud/75">
              G Store is a premium fashion commerce platform for bold
              silhouettes, elevated textures, and unapologetic confidence.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.17em] text-cloud/60">
                Navigate
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {footerLinks.map((link) => (
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
                Portfolio project
              </p>
              <ul className="mt-4 space-y-3 text-sm text-cloud/80">
                <li>Demo storefront. No real purchases.</li>
                <li>All prices shown in USD.</li>
                <li>Built with Next.js and PostgreSQL.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/15 py-5 text-xs uppercase tracking-[0.15em] text-cloud/60">
          {new Date().getFullYear()} G Store. Crafted for global style leaders.
        </div>
      </Container>
    </footer>
  );
}
