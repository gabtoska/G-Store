import Link from "next/link";
import { db } from "@/lib/db";
import { requirePageAdmin } from "@/server/authorization";
export default async function AdminPage() {
  await requirePageAdmin();
  const [products, orders, pending] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
  ]);
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {[
        ["Products", products, "/admin/products"],
        ["Orders", orders, "/admin/orders"],
        ["Pending orders", pending, "/admin/orders?status=PENDING"],
      ].map(([label, count, href]) => (
        <Link
          key={label}
          href={String(href)}
          className="panel transition hover:border-accent"
        >
          <p className="text-sm text-ink/65">{label}</p>
          <p className="mt-2 font-display text-5xl">{count}</p>
        </Link>
      ))}
    </div>
  );
}
