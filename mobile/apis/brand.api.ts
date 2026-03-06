import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { BrandInterface, BrandInput, StrapiBrandResponse, StrapiSingleBrandResponse } from "@/interface";

// Re-export for convenience; types now centralized in interface/brand.ts to avoid duplication
// (also re-export BrandInput/Strapi* for backward compat with form)
export type { BrandInput, StrapiBrandResponse, StrapiSingleBrandResponse } from "@/interface";

// Filters for list
export interface BrandFilters {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
  populate?: string[];
}

// Helper to clean payload for Strapi (omit undefined/null optional fields to avoid validation errors like regex on empty website or bad media ID)
const cleanBrandData = (data: BrandInput | Partial<BrandInput>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    // Keep required , omit undefined ; allow null for optional like logo to clear
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });
  // Ensure website is valid or omitted (prevents 400 from regex)
  if (cleaned.website && !cleaned.website.trim()) {
    delete cleaned.website;
  }
  return cleaned;
};

export const brandApi = {
  // GET /api/brands?populate=logo&...
  getBrands: (params?: BrandFilters) => {
    const populate = params?.populate || ["logo"];
    const query = getQueryString({ populate, ...params });
    const url = `${apiRoutes.BRANDS}${query}`;
    return apiClient.get<StrapiBrandResponse>(url);
  },

  // GET /api/brands/{id}?populate=logo
  getBrand: (id: string | number) => {
    const query = getQueryString({ populate: ["logo"] });
    const url = `${apiRoutes.BRAND(id.toString())}${query}`;
    return apiClient.get<StrapiSingleBrandResponse>(url);
  },

  // POST /api/brands with { data: cleaned } - fixes 400 by proper format/optional fields
  createBrand: (data: BrandInput) => {
    const cleaned = cleanBrandData(data);
    return apiClient.post<StrapiSingleBrandResponse>(apiRoutes.BRANDS, {
      data: cleaned, // Strapi requires {data: {...}} wrapper for create
    });
  },

  // PUT /api/brands/{id} with cleaned data - ensures no validation errors
  updateBrand: (id: string | number, data: Partial<BrandInput>) => {
    const cleaned = cleanBrandData(data);
    return apiClient.put<StrapiSingleBrandResponse>(apiRoutes.BRAND(id.toString()), {
      data: cleaned,
    });
  },

  // DELETE /api/brands/{id}
  deleteBrand: (id: string | number) => {
    return apiClient.delete(apiRoutes.BRAND(id.toString()));
  },

  // Helper for logo upload (Strapi media): POST /api/upload , returns file ID to attach
  // Note: Full FormData for create/update with logo in later step
  uploadLogo: (file: FormData) => {
    return apiClient.post("/api/upload", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default brandApi;
