import { useQuery } from "@tanstack/react-query";

import apiClient from "@/apis/apiClient";
import { apiRoutes } from "@/apis/apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ApiResponseInterface, CategoryInterface } from "@/interface";
import categoryApi from "@/apis/category.api";
import { QUERY_CONFIG } from "@/config/queryConfig";

const populate = ["image"];

/**
 * Hook to fetch categories list
 * Uses static config - categories rarely change
 */
export const useCategories = () => {
  return useQuery<CategoryInterface[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const config = getQueryString({ populate });
      const url = `${apiRoutes.CATEGORIES}${config}`;
      const response = await apiClient.get<ApiResponseInterface<CategoryInterface[]>>(
        url
      );
      return response.data.data;
    },
    ...QUERY_CONFIG.static,
  });
};

/**
 * Hook to fetch categories with attributes for product forms
 * Uses static config - categories with attributes rarely change
 */
export const useCategoriesForProducts = () => {
  return useQuery<CategoryInterface[]>({
    queryKey: ["categories", "withAttributes"],
    queryFn: async () => {
      const config = getQueryString({ populate: ["attributes"] });
      const url = `${apiRoutes.CATEGORIES}${config}`;
      const response = await apiClient.get<ApiResponseInterface<CategoryInterface[]>>(
        url
      );
      return response.data.data;
    },
    ...QUERY_CONFIG.static,
  });
};

/**
 * Hook to fetch a single category by documentId
 * Uses detail config - single item view
 */
export const useCategoryByDocumentId = (
  documentId: CategoryInterface["documentId"]
) => {
  return useQuery<CategoryInterface>({
    queryKey: ["category", documentId],
    queryFn: async () => {
      const response = await categoryApi.getCategory(documentId);
      return response.data.data;
    },
    enabled: !!documentId,
    ...QUERY_CONFIG.detail,
  });
};

/**
 * Hook to fetch a category with its attributes
 * Uses detail config - single item view
 */
export const useCategoryWithAttributes = (
  documentId: CategoryInterface["documentId"]
) => {
  return useQuery<CategoryInterface>({
    queryKey: ["category", documentId, "withAttributes"],
    queryFn: async () => {
      const response = await categoryApi.getCategoryWithAttributes(documentId);
      return response.data.data;
    },
    enabled: !!documentId,
    ...QUERY_CONFIG.detail,
  });
};

/**
 * Hook to search categories by name
 * Uses search config - short-lived, user expects fresh results
 */
export const useSearchCategories = (query: string, enabled: boolean = true) => {
  return useQuery<CategoryInterface[]>({
    queryKey: ["searchCategories", query],
    queryFn: async () => {
      const config = getQueryString({
        populate: ["image"],
        filters: {
          name: { $containsi: query },
        },
        pagination: { pageSize: 10 },
      });
      const url = `${apiRoutes.CATEGORIES}${config}`;

      const response = await apiClient.get<ApiResponseInterface<CategoryInterface[]>>(url);
      return response.data.data;
    },
    enabled: enabled && query.length >= 2,
    ...QUERY_CONFIG.search,
  });
};
