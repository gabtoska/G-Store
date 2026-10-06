import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { requirePageUser } from "@/server/authorization";
import { db } from "@/lib/db";
export default async function CheckoutPage() {
  const user = await requirePageUser("/checkout");
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return (
    <Container className="space-y-10 py-12 sm:py-16">
      <SectionHeading
        eyebrow="Checkout"
        title="Your next signature look."
        subtitle="Choose your shipping details, review the total, and place your demo order."
      />
      <CheckoutForm
        name={user.name}
        addresses={addresses.map((address) => ({
          id: address.id,
          fullName: address.fullName,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          region: address.region,
          postalCode: address.postalCode,
          country: "US",
        }))}
      />
    </Container>
  );
}
