import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import { ApiResponseInterface, CartInterface, CartItemInterface, ProductInterface } from "@/interface";

export interface AddToCartInput {
  product: string | number;
  quantity?: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CartCountResponse {
  count: number;
}

export interface CartOperationResponse {
  data: CartItemInterface | { deleted: boolean } | { cleared: boolean };
}

export const cartApi = {
  /**
   * Get current user's cart with all items
   */
  getCart: async (): Promise<{ data: CartInterface }> => {
    const response = await apiClient.get<ApiResponseInterface<CartInterface>>(apiRoutes.CART);
    return response.data;
  },

  /**
   * Add item to cart
   * If product already in cart, quantity will be added to existing
   */
  addToCart: async (input: AddToCartInput): Promise<{ data: CartItemInterface }> => {
    const response = await apiClient.post<ApiResponseInterface<CartItemInterface>>(
      apiRoutes.CART_ADD,
      { data: input }
    );
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (
    cartItemId: string,
    input: UpdateCartItemInput
  ): Promise<{ data: CartItemInterface }> => {
    const response = await apiClient.put<ApiResponseInterface<CartItemInterface>>(
      apiRoutes.CART_ITEM(cartItemId),
      { data: input }
    );
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (cartItemId: string): Promise<{ data: { deleted: boolean } }> => {
    const response = await apiClient.delete<{ data: { deleted: boolean } }>(
      apiRoutes.CART_ITEM(cartItemId)
    );
    return response.data;
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<{ data: { cleared: boolean } }> => {
    const response = await apiClient.delete<{ data: { cleared: boolean } }>(
      apiRoutes.CART_CLEAR
    );
    return response.data;
  },

  /**
   * Get cart item count
   */
  getCartCount: async (): Promise<{ data: CartCountResponse }> => {
    const response = await apiClient.get<{ data: CartCountResponse }>(apiRoutes.CART_COUNT);
    return response.data;
  },
};

export default cartApi;
