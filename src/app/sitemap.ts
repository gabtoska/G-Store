import type { MetadataRoute } from "next";

import { PRODUCTS } from "@/lib/products";

const BASE_URL = "https://gstore.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/cart`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/checkout`, changeFrequency: "weekly", priority: 0.7 }
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${BASE_URL}/shop/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  return [...staticRoutes, ...productRoutes];
}
