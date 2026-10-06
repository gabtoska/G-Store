import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LogoutButton } from "@/components/auth/logout-button";
import { requirePageUser } from "@/server/authorization";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requirePageUser();
  const raw = Number((await searchParams).page ?? 1);
  const page = Number.isInteger(raw) && raw > 0 && raw < 10000 ? raw : 1;
  const [orders, count, addresses] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 10,
      take: 10,
      include: { _count: { select: { items: true } } },
    }),
    db.order.count({ where: { userId: user.id } }),
    db.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return (
    <Container className="space-y-8 py-12">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">
            My account
          </p>
          <h1 className="font-display text-4xl">Welcome, {user.name}.</h1>
          <p className="mt-2 break-all text-ink/65">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {user.role === "ADMIN" && (
            <Link href="/admin" className="action-link">
              Manage store
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
      <section className="panel">
        <h2 className="mb-5 font-display text-3xl">Your orders</h2>
        {orders.length ? (
          <ul className="divide-y divide-black/10">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 py-5 hover:text-accent"
                >
                  <div>
                    <p className="font-semibold">
                      Order {order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-sm text-ink/65">
                      {order.createdAt.toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })}{" "}
                      · {order._count.items} items
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-wider">
                    {order.status}
                  </p>
                  <p className="font-semibold">
                    {formatMoney(order.totalCents)} →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink/70">
            No orders yet.{" "}
            <Link className="text-accent underline" href="/shop">
              Explore the collection.
            </Link>
          </p>
        )}
        {count > 10 && (
          <nav aria-label="Order pages" className="mt-5 flex gap-5">
            {page > 1 && (
              <Link href={`?page=${page - 1}`} className="underline">
                Previous
              </Link>
            )}
            <span>Page {page}</span>
            {page * 10 < count && (
              <Link href={`?page=${page + 1}`} className="underline">
                Next
              </Link>
            )}
          </nav>
        )}
      </section>
      <section className="panel">
        <h2 className="mb-5 font-display text-3xl">Saved addresses</h2>
        {addresses.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <address
                key={address.id}
                className="rounded-2xl bg-cloud p-4 text-sm not-italic"
              >
                <strong>{address.fullName}</strong>
                <p>{address.line1}</p>
                <p>{address.line2}</p>
                <p>
                  {address.city}, {address.region} {address.postalCode}
                </p>
                <p>United States</p>
              </address>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/65">
            Save a shipping address during checkout to use it again.
          </p>
        )}
      </section>
    </Container>
  );
}
