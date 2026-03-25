import { useQuery } from "@tanstack/react-query";

import apiClient from "@/apis/apiClient";
import { apiRoutes } from "@/apis/apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ApiResponseInterface, BrandInterface, CategoryInterface, ProductInterface } from "@/interface";

const populate = ["logo"];

export const useBrand = () => {
  return useQuery<BrandInterface[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const config = getQueryString({ populate });
      const url = `${apiRoutes.BRANDS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<BrandInterface[]>>(url);
      return response.data.data;
    },
    initialData: [],
    staleTime: 0,
  });
};

// Hook to fetch a single brand by documentId
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
    staleTime: 0,
  });
};

// Hook to fetch categories that have products for a specific brand
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
    staleTime: 0,
  });
};

// Hook to fetch products for a specific brand and category (lazy loaded)
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
    staleTime: 0,
  });
};

// Hook to fetch featured products for a brand (for gallery/carousel)
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
    staleTime: 0,
  });
};

// Hook to search brands by name
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
    staleTime: 0,
  });
};
