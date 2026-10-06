import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { requirePageAdmin } from "@/server/authorization";
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requirePageAdmin();
  const { q = "", page: raw = "1" } = await searchParams;
  const page = Math.max(1, Math.min(10000, Number(raw) || 1));
  const where = {
    name: { contains: q.slice(0, 100), mode: "insensitive" as const },
  };
  const [products, count] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
      skip: (Math.floor(page) - 1) * 20,
    }),
    db.product.count({ where }),
  ]);
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Products ({count})</h2>
        <Link href="/admin/products/new" className="action-link">
          Create product
        </Link>
      </div>
      <form className="flex gap-3">
        <input
          aria-label="Search products"
          name="q"
          defaultValue={q}
          placeholder="Search products"
          className="field max-w-sm"
        />
        <button className="action-link">Search</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="panel space-y-2 hover:border-accent"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <h3 className="font-semibold">{product.name}</h3>
              <span className="text-xs uppercase text-accent">
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-ink/65">
              {product.category.name} · {formatMoney(product.priceCents)}
            </p>
            <p className="text-sm">{product.stock} in stock · Edit →</p>
          </Link>
        ))}
      </div>
      {!products.length && <p className="panel">No products found.</p>}
      <nav aria-label="Admin product pages" className="flex gap-5">
        {page > 1 && (
          <Link
            href={`?q=${encodeURIComponent(q)}&page=${page - 1}`}
            className="underline"
          >
            Previous
          </Link>
        )}
        {page * 20 < count && (
          <Link
            href={`?q=${encodeURIComponent(q)}&page=${page + 1}`}
            className="underline"
          >
            Next
          </Link>
        )}
      </nav>
    </section>
  );
}
