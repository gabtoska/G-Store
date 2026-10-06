import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db";
import { requirePageAdmin } from "@/server/authorization";
export default async function NewProductPage() {
  await requirePageAdmin();
  return (
    <ProductForm
      categories={await db.category.findMany({ orderBy: { name: "asc" } })}
    />
  );
}
