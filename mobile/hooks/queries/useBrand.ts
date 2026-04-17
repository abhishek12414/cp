import { useQuery } from "@tanstack/react-query";

import apiClient from "@/apis/apiClient";
import { apiRoutes } from "@/apis/apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ApiResponseInterface, BrandInterface, CategoryInterface, ProductInterface } from "@/interface";
import { QUERY_CONFIG } from "@/config/queryConfig";

const populate = ["logo"];

/**
 * Hook to fetch all brands
 * Uses static config - brands rarely change
 */
export const useBrand = () => {
  return useQuery<BrandInterface[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const config = getQueryString({ populate });
      const url = `${apiRoutes.BRANDS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<BrandInterface[]>>(url);
      return response.data.data;
    },
    ...QUERY_CONFIG.static,
  });
};

/**
 * Hook to fetch a single brand by documentId
 * Uses detail config - single item view
 */
export const useBrandByDocumentId = (documentId: string) => {
  return useQuery<BrandInterface | null>({
    queryKey: ["brand", documentId],
    queryFn: async () => {
      const config = getQueryString({ populate });
      const url = `${apiRoutes.BRAND(documentId)}${config}`;

      const response = await apiClient.get<ApiResponseInterface<BrandInterface>>(url);
      return response.data.data;
    },
    enabled: !!documentId,
    ...QUERY_CONFIG.detail,
  });
};

/**
 * Hook to fetch categories that have products for a specific brand
 * Uses semiStatic config - derived from products
 */
export const useBrandCategories = (brandDocumentId: string) => {
  return useQuery<CategoryInterface[]>({
    queryKey: ["brandCategories", brandDocumentId],
    queryFn: async () => {
      // First get all products for this brand, then extract unique categories
      const config = getQueryString({
        populate: ["category", "category.image"],
        filters: {
          brand: { documentId: { $eq: brandDocumentId } },
        },
        pagination: { pageSize: 100 },
      });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<ProductInterface[]>>(url);
      const products = response.data.data;

      // Extract unique categories
      const categoryMap = new Map<string, CategoryInterface>();
      products.forEach((product) => {
        if (product.category && product.category.documentId) {
          categoryMap.set(product.category.documentId, product.category);
        }
      });

      return Array.from(categoryMap.values());
    },
    enabled: !!brandDocumentId,
    ...QUERY_CONFIG.semiStatic,
  });
};

/**
 * Hook to fetch products for a specific brand and category (lazy loaded)
 * Uses semiStatic config - products
 */
export const useBrandCategoryProducts = (brandDocumentId: string, categoryDocumentId: string, enabled: boolean = false) => {
  return useQuery<ProductInterface[]>({
    queryKey: ["brandCategoryProducts", brandDocumentId, categoryDocumentId],
    queryFn: async () => {
      const config = getQueryString({
        populate: ["images", "category", "brand"],
        filters: {
          brand: { documentId: { $eq: brandDocumentId } },
          category: { documentId: { $eq: categoryDocumentId } },
        },
        pagination: { pageSize: 20 },
      });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<ProductInterface[]>>(url);
      return response.data.data;
    },
    enabled: enabled && !!brandDocumentId && !!categoryDocumentId,
    ...QUERY_CONFIG.semiStatic,
  });
};

/**
 * Hook to fetch featured products for a brand (for gallery/carousel)
 * Uses semiStatic config - products
 */
export const useBrandFeaturedProducts = (brandDocumentId: string) => {
  return useQuery<ProductInterface[]>({
    queryKey: ["brandFeaturedProducts", brandDocumentId],
    queryFn: async () => {
      const config = getQueryString({
        populate: ["images", "category", "brand"],
        filters: {
          brand: { documentId: { $eq: brandDocumentId } },
        },
        pagination: { pageSize: 10 },
      });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<ProductInterface[]>>(url);
      return response.data.data;
    },
    enabled: !!brandDocumentId,
    ...QUERY_CONFIG.semiStatic,
  });
};

/**
 * Hook to search brands by name
 * Uses search config - short-lived, user expects fresh results
 */
export const useSearchBrands = (query: string, enabled: boolean = true) => {
  return useQuery<BrandInterface[]>({
    queryKey: ["searchBrands", query],
    queryFn: async () => {
      const config = getQueryString({
        populate: ["logo"],
        filters: {
          name: { $containsi: query },
        },
        pagination: { pageSize: 10 },
      });
      const url = `${apiRoutes.BRANDS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<BrandInterface[]>>(url);
      return response.data.data;
    },
    enabled: enabled && query.length >= 2,
    ...QUERY_CONFIG.search,
  });
};
