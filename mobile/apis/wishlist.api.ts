import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ProductInterface } from "@/interface";

export interface WishlistItem {
  id: number;
  documentId?: string;
  user?: any;
  product?: ProductInterface;
  createdAt?: string;
  updatedAt?: string;
}

export interface WishlistToggleResponse {
  data: {
    inWishlist: boolean;
    added?: boolean;
    removed?: boolean;
    wishlist?: WishlistItem;
  };
}

export interface WishlistCheckResponse {
  data: {
    inWishlist: boolean;
  };
}

export const wishlistApi = {
  // Get current user's wishlist
  getWishlist: () => {
    return apiClient.get<{ data: WishlistItem[] }>(apiRoutes.WISHLISTS);
  },

  // Add product to wishlist
  addToWishlist: (productId: number | string) => {
    return apiClient.post<{ data: WishlistItem }>(apiRoutes.WISHLISTS, {
      product: productId,
    });
  },

  // Remove product from wishlist by wishlist entry ID
  removeFromWishlist: (wishlistId: number | string) => {
    return apiClient.delete(`${apiRoutes.WISHLISTS}/${wishlistId}`);
  },

  // Toggle wishlist (add if not present, remove if present)
  toggleWishlist: (productId: number | string) => {
    return apiClient.post<WishlistToggleResponse>(apiRoutes.WISHLIST_TOGGLE, {
      product: productId,
    });
  },

  // Check if product is in wishlist
  checkWishlist: (productId: number | string) => {
    const query = getQueryString({ productId });
    return apiClient.get<WishlistCheckResponse>(`${apiRoutes.WISHLIST_CHECK}${query}`);
  },
};

export default wishlistApi;
