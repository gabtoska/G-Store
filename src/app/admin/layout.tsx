import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { requirePageAdmin } from "@/server/authorization";
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePageAdmin();
  return (
    <Container className="space-y-8 py-12">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent">
          Store management
        </p>
        <h1 className="font-display text-4xl">G Store admin</h1>
      </div>
      <nav
        aria-label="Admin navigation"
        className="flex flex-wrap gap-6 border-b border-black/10 pb-5 text-sm font-semibold"
      >
        <Link href="/admin">Overview</Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/account">My account</Link>
      </nav>
      {children}
    </Container>
  );
}
