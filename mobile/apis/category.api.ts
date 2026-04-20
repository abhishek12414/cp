import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import uploadApi from "./upload.api";
import { getQueryString } from "@/helpers/queryParams";
import { CategoryInterface, ApiResponseInterface } from "@/interface";

// Input type for create/update (matches Strapi category schema.json)
export interface CategoryInput {
  name: string;
  slug?: string; // auto-generated from name by Strapi uid field
  description?: string;
  isActive?: boolean;
  // image: Strapi media ID from /api/upload (number or null to keep existing)
  image?: number | null;
}

// Filters for list queries
export interface CategoryFilters {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
}

// Helper to clean payload – omit undefined fields to avoid Strapi validation errors
const cleanCategoryData = (data: CategoryInput | Partial<CategoryInput>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

export const categoryApi = {
  // GET /api/categories
  getCategories: (params?: CategoryFilters) => {
    const query = getQueryString({ ...params });
    const url = `${apiRoutes.CATEGORIES}${query}`;
    return apiClient.get<ApiResponseInterface<CategoryInterface[]>>(url);
  },

  // GET /api/categories/{documentId}
  getCategory: (documentId: string) => {
    const query = getQueryString({ populate: ["image"] });
    const url = `${apiRoutes.CATEGORY(documentId)}${query}`;
    return apiClient.get<ApiResponseInterface<CategoryInterface>>(url);
  },

  // GET /api/categories/{documentId} with attributes populated
  getCategoryWithAttributes: (documentId: string) => {
    const query = getQueryString({ populate: ["image", "attributes"] });
    const url = `${apiRoutes.CATEGORY(documentId)}${query}`;
    return apiClient.get<ApiResponseInterface<CategoryInterface>>(url);
  },

  // POST /api/categories with { data: cleaned }
  createCategory: (data: CategoryInput) => {
    const cleaned = cleanCategoryData(data);
    return apiClient.post<ApiResponseInterface<CategoryInterface>>(apiRoutes.CATEGORIES, {
      data: cleaned,
    });
  },

  // PUT /api/categories/{documentId}
  updateCategory: (documentId: string, data: Partial<CategoryInput>) => {
    const cleaned = cleanCategoryData(data);
    return apiClient.put<ApiResponseInterface<CategoryInterface>>(apiRoutes.CATEGORY(documentId), {
      data: cleaned,
    });
  },

  // DELETE /api/categories/{documentId}
  deleteCategory: (documentId: string) => {
    return apiClient.delete(apiRoutes.CATEGORY(documentId));
  },

  // Helper for image upload (Strapi media): POST /api/upload
  uploadImage: uploadApi.uploadFile,
};

export default categoryApi;
