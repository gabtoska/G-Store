import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/orders/order-detail";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { db } from "@/lib/db";
import { requirePageAdmin } from "@/server/authorization";
export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAdmin();
  const order = await db.order.findUnique({
    where: { id: (await params).id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  if (!order) notFound();
  return (
    <section className="space-y-6">
      <h2 className="font-display text-3xl">
        Order {order.id.slice(-8).toUpperCase()}
      </h2>
      <p className="break-all text-sm text-ink/65">
        {order.user.name} · {order.user.email}
      </p>
      <OrderStatusForm key={order.status} id={order.id} status={order.status} />
      <OrderDetail order={order} />
    </section>
  );
}
