import { ImageInterface } from "./image";

export interface CategoryInterface {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  image: ImageInterface | null;
}
