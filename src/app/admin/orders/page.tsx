import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePageAdmin } from "@/server/authorization";
import { formatMoney } from "@/lib/format";
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requirePageAdmin();
  const params = await searchParams;
  const status = Object.values(OrderStatus).find(
    (status) => status === params.status,
  );
  const page = Math.floor(
    Math.max(1, Math.min(10000, Number(params.page) || 1)),
  );
  const where = status ? { status } : {};
  const [orders, count] = await Promise.all([
    db.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
      skip: (page - 1) * 20,
    }),
    db.order.count({ where }),
  ]);
  return (
    <section className="space-y-6">
      <h2 className="font-display text-3xl">Orders ({count})</h2>
      <form className="flex flex-wrap gap-3">
        <select
          aria-label="Order status"
          name="status"
          defaultValue={status ?? ""}
          className="field max-w-xs"
        >
          <option value="">All statuses</option>
          {Object.values(OrderStatus).map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <button className="action-link">Filter</button>
      </form>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            href={`/admin/orders/${order.id}`}
            key={order.id}
            className="panel flex flex-wrap items-center justify-between gap-5 hover:border-accent"
          >
            <div className="min-w-0">
              <p className="font-semibold">
                {order.id.slice(-8).toUpperCase()} · {order.user.name}
              </p>
              <p className="break-all text-sm text-ink/60">
                {order.user.email}
              </p>
              <p className="text-xs text-ink/60">
                {order.createdAt.toLocaleDateString("en-US", {
                  timeZone: "UTC",
                })}
              </p>
            </div>
            <p className="text-xs uppercase">{order.status}</p>
            <p className="font-semibold">{formatMoney(order.totalCents)} →</p>
          </Link>
        ))}
      </div>
      {!orders.length && <p className="panel">No orders found.</p>}
      <nav aria-label="Admin order pages" className="flex gap-5">
        {page > 1 && (
          <Link
            className="underline"
            href={`?status=${status ?? ""}&page=${page - 1}`}
          >
            Previous
          </Link>
        )}
        {page * 20 < count && (
          <Link
            className="underline"
            href={`?status=${status ?? ""}&page=${page + 1}`}
          >
            Next
          </Link>
        )}
      </nav>
    </section>
  );
}
