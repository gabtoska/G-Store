"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/account", label: "Account" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const closeCart = useCallback(() => setCartOpen(false), []);

  return (
    <>
      <div className="border-b border-black/10 bg-ink px-4 py-2 text-center text-[11px] uppercase tracking-[0.14em] text-cloud">
        Portfolio demo · No real payments or shipments · Free demo shipping over
        $250
      </div>
      <header className="sticky top-0 z-30 border-b border-black/10 bg-cloud/85 backdrop-blur-xl">
        <Container>
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="group inline-flex flex-col leading-none">
              <span className="font-display text-2xl text-ink transition group-hover:text-accent">
                G Store
              </span>
              <span className="text-[10px] uppercase tracking-[0.19em] text-ink/55">
                Dress Like A G
              </span>
            </Link>

            <nav className="hidden items-center gap-8 lg:flex">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-[0.15em] transition",
                      active ? "text-accent" : "text-ink/70 hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                aria-label="Open cart drawer"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-cloud">
                  {itemCount}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((previous) => !previous)}
              >
                {menuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div
            inert={!menuOpen}
            className={cn(
              "grid overflow-hidden border-t border-black/10 transition-all duration-300 lg:hidden",
              menuOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <nav className="space-y-1 py-4">
                {links.map((link) => {
                  const active =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em]",
                        active
                          ? "bg-accent text-cloud"
                          : "text-ink/75 hover:bg-black/5 hover:text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </Container>
      </header>
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </>
  );
}
