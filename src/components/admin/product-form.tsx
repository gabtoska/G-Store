"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { requestJson } from "@/lib/client-api";
import { productSchema } from "@/lib/validation";
import type { Product } from "@/lib/types";

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "");
    const list = (key: string) =>
      value(key)
        .split(key === "gallery" ? "\n" : ",")
        .map((v) => v.trim())
        .filter(Boolean);
    try {
      const result = productSchema.safeParse({
        name: value("name"),
        slug: value("slug"),
        tagline: value("tagline"),
        description: value("description"),
        categoryId: value("categoryId"),
        collection: value("collection"),
        priceCents: Math.round(Number(value("price")) * 100),
        compareAtCents: value("compareAt")
          ? Math.round(Number(value("compareAt")) * 100)
          : null,
        stock: Number(value("stock")),
        gallery: list("gallery"),
        colors: list("colors"),
        sizes: list("sizes"),
        materials: list("materials"),
        isActive: form.has("isActive"),
        isNew: form.has("isNew"),
        isFeatured: form.has("isFeatured"),
      });
      if (!result.success)
        throw new Error(
          result.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(" "),
        );
      await requestJson(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        product
          ? { product: result.data, version: product.version }
          : result.data,
        product ? "PATCH" : "POST",
      );
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to save product.",
      );
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="panel space-y-6">
      <h2 className="font-display text-3xl">
        {product ? "Edit product" : "Create product"}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="field-label">
          Name
          <input
            className="field"
            name="name"
            defaultValue={product?.name}
            required
            maxLength={120}
          />
        </label>
        <label className="field-label">
          Slug
          <input
            className="field"
            name="slug"
            defaultValue={product?.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            maxLength={120}
          />
        </label>
        <label className="field-label">
          Category
          <select
            className="field"
            name="categoryId"
            defaultValue={product?.categoryId}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Collection
          <input
            className="field"
            name="collection"
            defaultValue={product?.collection ?? "Essentials"}
            required
            maxLength={60}
          />
        </label>
        <label className="field-label">
          Price (USD)
          <input
            className="field"
            type="number"
            name="price"
            defaultValue={product ? product.priceCents / 100 : undefined}
            required
            min="0.01"
            max="100000"
            step="0.01"
          />
        </label>
        <label className="field-label">
          Compare-at price (optional, USD)
          <input
            className="field"
            type="number"
            name="compareAt"
            defaultValue={
              product?.compareAtCents ? product.compareAtCents / 100 : ""
            }
            min="0.01"
            max="100000"
            step="0.01"
          />
        </label>
        <label className="field-label">
          Stock
          <input
            className="field"
            type="number"
            name="stock"
            defaultValue={product?.stock ?? 0}
            required
            min="0"
            max="1000000"
            step="1"
          />
        </label>
        <label className="field-label">
          Tagline
          <input
            className="field"
            name="tagline"
            defaultValue={product?.tagline}
            required
            maxLength={200}
          />
        </label>
        <label className="field-label sm:col-span-2">
          Description
          <textarea
            className="field"
            name="description"
            defaultValue={product?.description}
            required
            maxLength={5000}
            rows={4}
          />
        </label>
        {(["colors", "sizes", "materials"] as const).map((key) => (
          <label key={key} className="field-label capitalize">
            {key} (comma separated)
            <input
              className="field"
              name={key}
              defaultValue={product?.[key].join(", ")}
              required
            />
          </label>
        ))}
        <label className="field-label sm:col-span-2">
          Images (one HTTPS images.unsplash.com URL per line, first is cover)
          <textarea
            className="field"
            name="gallery"
            defaultValue={product?.gallery.join("\n")}
            rows={4}
            required
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-6">
        {(
          [
            ["isActive", "Active in storefront", product?.isActive ?? true],
            ["isNew", "New arrival", product?.isNew],
            ["isFeatured", "Featured", product?.isFeatured],
          ] as const
        ).map(([key, label, checked]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={key} defaultChecked={checked} />
            {label}
          </label>
        ))}
      </div>
      <p className="text-sm text-ink/60">
        Uncheck “Active in storefront” to deactivate a product. Previous order
        records are preserved. Stock is shared across all sizes and colors.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save product"}
      </Button>
    </form>
  );
}
