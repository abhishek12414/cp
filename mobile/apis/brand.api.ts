import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import uploadApi from "./upload.api";
import { getQueryString } from "@/helpers/queryParams";
import { BrandInterface, BrandInput, ApiResponseInterface } from "@/interface";

// Re-export for convenience; types now centralized in interface/brand.ts to avoid duplication
// (also re-export BrandInput for backward compat with form)
export type { BrandInput } from "@/interface";

// Filters for list
export interface BrandFilters {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
  populate?: string[];
}

// Helper to clean payload for Strapi (omit undefined/null optional fields to avoid validation errors like regex on empty website or bad media ID)
const cleanBrandData = (
  data: BrandInput | Partial<BrandInput>,
): Record<string, any> => {
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
    return apiClient.get<ApiResponseInterface<BrandInterface[]>>(url);
  },

  // GET /api/brands/{id}?populate=logo
  getBrand: (id: string | number) => {
    const query = getQueryString({ populate: ["logo"] });
    const url = `${apiRoutes.BRAND(id.toString())}${query}`;
    return apiClient.get<ApiResponseInterface<BrandInterface>>(url);
  },

  // GET /api/brands/{documentId} with full populate for brand page
  getBrandByDocumentId: (documentId: string) => {
    const query = getQueryString({ populate: ["logo"] });
    const url = `${apiRoutes.BRAND(documentId)}${query}`;
    return apiClient.get<ApiResponseInterface<BrandInterface>>(url);
  },

  // POST /api/brands with { data: cleaned } - fixes 400 by proper format/optional fields
  createBrand: (data: BrandInput) => {
    const cleaned = cleanBrandData(data);
    return apiClient.post<ApiResponseInterface<BrandInterface>>(
      apiRoutes.BRANDS,
      {
        data: cleaned, // Strapi requires {data: {...}} wrapper for create
      },
    );
  },

  // PUT /api/brands/{id} with cleaned data - ensures no validation errors
  updateBrand: (id: string | number, data: Partial<BrandInput>) => {
    const cleaned = cleanBrandData(data);
    return apiClient.put<ApiResponseInterface<BrandInterface>>(
      apiRoutes.BRAND(id.toString()),
      {
        data: cleaned,
      },
    );
  },

  // DELETE /api/brands/{id}
  deleteBrand: (id: string | number) => {
    return apiClient.delete(apiRoutes.BRAND(id.toString()));
  },

  // Helper for logo upload (Strapi media): POST /api/upload , returns file ID to attach
  // Note: Full FormData for create/update with logo in later step
  uploadLogo: uploadApi.uploadFile,
};

export default brandApi;
