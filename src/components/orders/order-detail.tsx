import type { Prisma } from "@prisma/client";
import { formatMoney } from "@/lib/format";
import { addressSchema } from "@/lib/validation";
export function OrderDetail({
  order,
}: {
  order: Prisma.OrderGetPayload<{ include: { items: true } }>;
}) {
  const address = addressSchema.parse(order.shippingAddress);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="panel">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <h2 className="font-display text-3xl">Your pieces</h2>
          <span className="rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold text-accent">
            {order.status}
          </span>
        </div>
        <ul className="divide-y divide-black/10">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap justify-between gap-4 py-4"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-ink/60">
                  {item.color} / {item.size} · Qty {item.quantity}
                </p>
                <p className="text-xs text-ink/60">
                  {formatMoney(item.unitPriceCents)} each
                </p>
              </div>
              <p>{formatMoney(item.unitPriceCents * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>
      <aside className="space-y-5">
        <section className="panel">
          <h2 className="mb-4 font-display text-2xl">Order total</h2>
          <dl className="space-y-3 text-sm">
            {[
              ["Subtotal", order.subtotalCents],
              ["Shipping", order.shippingCents],
              ["Demo tax (8%)", order.taxCents],
              ["Total", order.totalCents],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt>{label}</dt>
                <dd className="font-semibold">{formatMoney(Number(value))}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 rounded-xl bg-accent/10 p-3 text-sm text-accent">
            Demo pay on delivery. No payment collected. No physical shipment
            will be sent.
          </p>
        </section>
        <section className="panel">
          <h2 className="mb-3 font-display text-2xl">Shipping address</h2>
          <address className="text-sm not-italic leading-relaxed">
            <strong>{address.fullName}</strong>
            <p>{address.line1}</p>
            <p>{address.line2}</p>
            <p>
              {address.city}, {address.region} {address.postalCode}
            </p>
            <p>United States</p>
          </address>
        </section>
      </aside>
    </div>
  );
}
