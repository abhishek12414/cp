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
  // Full logo media from Strapi for display/upload handling
  logo?: {
    data?: {
      id: number;
      attributes: {
        url: string;
        formats?: {
          thumbnail?: { url: string };
          small?: { url: string };
        };
      };
    } | null;
  };
}

// Extended for form input (matches Strapi schema.json)
export interface BrandInput {
  name: string;
  slug?: string; // auto-generated
  description?: string;
  website?: string;
  isActive?: boolean;
  // logo: Strapi media ID from /api/upload (number or null to keep existing)
  // See: https://docs.strapi.io/dev-docs/api/rest/media-upload
  logo?: number | null;
}

// Strapi API response wrappers (for brand.api.ts)
export interface StrapiBrandResponse {
  data: {
    id: number;
    attributes: BrandInterface;
    // documentId in v4+ Strapi
  }[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleBrandResponse {
  data: {
    id: number;
    attributes: BrandInterface;
  };
}
