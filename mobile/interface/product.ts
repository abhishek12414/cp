import { AttributeInterface } from "./attribute";
import { BrandInterface } from "./brand";
import { CategoryInterface } from "./category";
import { ImageInterface } from "./image";

export interface ProductAttributeInterface {
  id: number;
  documentId?: string;
  value: string;
  attribute: AttributeInterface | { data?: AttributeInterface };
}

export interface ProductInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  sku?: string;
  stockQuantity?: number;
  category?: string | null;
  brand?: string | null;
  images?: number[];
  attributeValues?: number[];
}

export interface ProductInterface {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  stock?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  weight?: number | null;
  dimensions?: any | null;
  isFeatured?: boolean;
  isActive?: boolean;
  rating?: number | null;
  reviewCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  category?: CategoryInterface;
  brand?: BrandInterface;
  variants?: any[];
  tags?: any[];
  images?: ImageInterface[];
  bannerImage?: ImageInterface | null;
  productAttributes?: ProductAttributeInterface[];
  attributeValues?: ProductAttributeInterface[];
}
