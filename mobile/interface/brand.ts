export interface BrandInterface {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  logoUrl: string | null;
}
