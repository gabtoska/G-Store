import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { ProductCard } from "@/components/shop/product-card";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { getProductBySlug, getRelatedProducts } from "@/server/catalog";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product, 3);

  return (
    <div className="py-10 sm:py-14">
      <Container className="space-y-14">
        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <ProductGallery name={product.name} images={product.gallery} />
          <ProductPurchasePanel product={product} />
        </section>

        <section className="grid gap-8 rounded-[34px] border border-black/10 bg-white/80 p-7 sm:p-9 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-ink">Material Notes</h2>
            <div className="flex flex-wrap gap-2">
              {product.materials.map((material) => (
                <Pill key={material}>{material}</Pill>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-ink/70">
              Every piece is finished in limited runs with strict quality
              controls to preserve shape, texture, and wearability.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-ink">
              Delivery & Returns
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-ink/70">
              <li>US addresses supported in this portfolio demo.</li>
              <li>Shipping estimate: $12, free on orders over $250.</li>
              <li>Demo tax: 8% of the product subtotal.</li>
              <li>Demo pay on delivery. No payment or physical shipment.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-7">
          <h2 className="font-display text-4xl text-ink">You may also like</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
