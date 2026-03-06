import { ImageInterface } from "./image";

export interface CategoryInterface {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  // Media relation from Strapi (populate=image)
  image?: {
    data?: {
      id: number;
      attributes: ImageInterface;
    } | null;
  } | null;
}
