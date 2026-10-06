import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db";
import { requirePageAdmin } from "@/server/authorization";
import { serializeProduct } from "@/server/catalog";
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAdmin();
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id: (await params).id },
      include: { category: true },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <ProductForm
      key={product.version}
      product={serializeProduct(product)}
      categories={categories}
    />
  );
}
