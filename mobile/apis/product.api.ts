import { apiClient } from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import { ApiResponseInterface } from "@/interface";

export interface Product {
  id: string;
  attributes: {
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    sku: string;
    stock: number;
    images: {
      data: Array<{
        id: number;
        attributes: {
          url: string;
          formats: {
            thumbnail: { url: string };
            small: { url: string };
            medium: { url: string };
            large: { url: string };
          };
        };
      }>;
    };
    category: {
      data: {
        id: number;
        attributes: {
          name: string;
          slug: string;
        };
      };
    };
    brand: {
      data: {
        id: number;
        attributes: {
          name: string;
          slug: string;
          logo: {
            data: {
              attributes: {
                url: string;
              };
            };
          };
        };
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
}

export const productApi = {
  getProducts: (params?: ProductFilters) => {
    return apiClient.get<ApiResponseInterface<Product[]>>(apiRoutes.PRODUCTS, { params });
  },

  getProduct: (id: string) => {
    return apiClient.get<ApiResponseInterface<Product>>(apiRoutes.PRODUCT(id));
  },

  searchProducts: (query: string, params?: ProductFilters) => {
    return apiClient.get<ApiResponseInterface<Product[]>>(apiRoutes.SEARCH_PRODUCTS, {
      params: {
        query,
        ...params,
      },
    });
  },
};

export default productApi;
