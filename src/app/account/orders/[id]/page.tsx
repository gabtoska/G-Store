import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { OrderDetail } from "@/components/orders/order-detail";
import { db } from "@/lib/db";
import { requirePageUser } from "@/server/authorization";
export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const user = await requirePageUser();
  const order = await db.order.findFirst({
    where: { id: (await params).id, userId: user.id },
    include: { items: true },
  });
  if (!order) notFound();
  const placed = (await searchParams).placed === "1";
  return (
    <Container className="space-y-7 py-12">
      <Link href="/account" className="text-sm underline">
        ← All orders
      </Link>
      {placed && (
        <div role="status" className="panel border-accent/25">
          <h1 className="font-display text-4xl">
            Thank you. Your demo order is confirmed.
          </h1>
          <p className="mt-3 text-ink/70">
            Your order has been saved. No payment was taken and no confirmation
            email is sent.
          </p>
        </div>
      )}
      <h2 className="font-display text-3xl">
        Order {order.id.slice(-8).toUpperCase()}
      </h2>
      <p className="text-sm text-ink/65">
        Placed{" "}
        {order.createdAt.toLocaleDateString("en-US", { timeZone: "UTC" })}
      </p>
      <OrderDetail order={order} />
    </Container>
  );
}
