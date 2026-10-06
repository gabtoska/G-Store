export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  categoryId: string;
  collection: string;
  priceCents: number;
  compareAtCents?: number;
  image: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  isNew: boolean;
  isFeatured: boolean;
  stock: number;
  colors: string[];
  sizes: string[];
  materials: string[];
  gallery: string[];
}

export interface CartLine {
  id: string;
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  stock: number;
}

export interface CartState {
  lines: CartLine[];
}
