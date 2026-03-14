import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import {
  ApiResponseInterface,
  ProductInput,
  ProductInterface,
} from "@/interface";

export interface ProductAttributeValueInput {
  attribute: number;
  value: string;
  product?: number;
}

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
}

export const productApi = {
  getProducts: (params?: ProductFilters) => {
    return apiClient.get<ApiResponseInterface<ProductInterface[]>>(
      apiRoutes.PRODUCTS,
      {
        params,
      },
    );
  },

  getProduct: (id: string) => {
    return apiClient.get<ApiResponseInterface<ProductInterface>>(
      apiRoutes.PRODUCT(id),
    );
  },

  searchProducts: (query: string, params?: ProductFilters) => {
    return apiClient.get<ApiResponseInterface<ProductInterface[]>>(
      apiRoutes.SEARCH_PRODUCTS,
      {
        params: {
          query,
          ...params,
        },
      },
    );
  },

  createProduct: (data: ProductInput) => {
    return apiClient.post(apiRoutes.PRODUCTS, { data });
  },

  updateProduct: (documentId: string, data: Partial<ProductInput>) => {
    return apiClient.put(apiRoutes.PRODUCT(documentId), { data });
  },

  deleteProduct: (documentId: string) => {
    return apiClient.delete(apiRoutes.PRODUCT(documentId));
  },

  uploadImage: (file: FormData) => {
    return apiClient.post("/api/upload", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  createAttributeValue: (data: ProductAttributeValueInput) => {
    return apiClient.post(apiRoutes.PRODUCT_ATTRIBUTE_VALUES, { data });
  },

  updateAttributeValue: (
    documentId: string,
    data: ProductAttributeValueInput,
  ) => {
    return apiClient.put(
      `${apiRoutes.PRODUCT_ATTRIBUTE_VALUES}/${documentId}`,
      { data },
    );
  },
};

export default productApi;
