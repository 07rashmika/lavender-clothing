export type ProductStatus = "ACTIVE" | "DRAFT" | "OUT_OF_STOCK";

export interface Product {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stock: number;
  status: ProductStatus;
  tag: string | null;
  sizes: string[];
  colors: string[];
  description: string;
  fabric: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}
