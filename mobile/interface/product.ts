import { AttributeInterface } from "./attribute";
import { BrandInterface } from "./brand";
import { CategoryInterface } from "./category";
import { ImageInterface } from "./image";

export interface ProductAttributeInterface {
  id: number;
  value: string;
  attribute: AttributeInterface;
}

export interface ProductInterface {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight: number | null;
  dimensions: any | null;
  isFeatured: boolean;
  isActive: boolean;
  rating: number | null;
  reviewCount: number;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  category: CategoryInterface;
  brand: BrandInterface;
  variants: any[];
  tags: any[];
  images: ImageInterface[];
  bannerImage: ImageInterface | null;
  productAttributes: ProductAttributeInterface[];
}
