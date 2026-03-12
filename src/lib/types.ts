export type Category = "Outerwear" | "Tops" | "Bottoms" | "Accessories" | "Footwear";
export type Collection = "Runway" | "Essentials" | "Street" | "Resort";

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  collection: Collection;
  priceCents: number;
  compareAtCents?: number;
  rating: number;
  reviewCount: number;
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
}

export interface CartState {
  lines: CartLine[];
}
